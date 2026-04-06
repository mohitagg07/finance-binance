/**
 * src/controllers/dashboardController.js
 *
 * All analytics use MongoDB Aggregation Pipelines —
 * the native, high-performance way to do GROUP BY, SUM, and trend queries.
 *
 * Access levels:
 *   viewer+   → summary, recentActivity
 *   analyst+  → byCategory, monthlyTrends, weeklyTrends, topCategories
 *   admin     → auditLogs
 */

const FinancialRecord = require("../models/FinancialRecord");
const AuditLog        = require("../models/AuditLog");
const { parsePagination, buildPaginationMeta } = require("../utils/paginate");

// ── Summary ───────────────────────────────────────────────────────────────────
async function summary(_req, res, next) {
  try {
    const [result] = await FinancialRecord.aggregate([
      { $match: { deletedAt: null } },
      {
        $group: {
          _id:           null,
          total_income:  { $sum: { $cond: [{ $eq: ["$type", "income"]  }, "$amount", 0] } },
          total_expenses:{ $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } },
          total_records: { $sum: 1 },
        },
      },
    ]);

    const data = result ?? { total_income: 0, total_expenses: 0, total_records: 0 };

    return res.json({
      summary: {
        total_income:   data.total_income,
        total_expenses: data.total_expenses,
        net_balance:    data.total_income - data.total_expenses,
        total_records:  data.total_records,
      },
    });
  } catch (err) { next(err); }
}

// ── Category Breakdown ────────────────────────────────────────────────────────
async function byCategory(_req, res, next) {
  try {
    const rows = await FinancialRecord.aggregate([
      { $match: { deletedAt: null } },
      {
        $group: {
          _id:   { category: "$category", type: "$type" },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Group into: { category → { income, expense, count } }
    const grouped = {};
    for (const row of rows) {
      const { category, type } = row._id;
      if (!grouped[category]) grouped[category] = { category, income: 0, expense: 0, count: 0 };
      grouped[category][type]  = row.total;
      grouped[category].count += row.count;
    }

    return res.json({ categories: Object.values(grouped) });
  } catch (err) { next(err); }
}

// ── Monthly Trends ────────────────────────────────────────────────────────────
async function monthlyTrends(req, res, next) {
  try {
    const year = parseInt(req.query.year || new Date().getFullYear(), 10);

    const rows = await FinancialRecord.aggregate([
      {
        $match: {
          deletedAt: null,
          date: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id:   { month: { $month: "$date" }, type: "$type" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    // Build full 12-month array (fill 0 for months with no data)
    const trends = Array.from({ length: 12 }, (_, i) => {
      const month   = i + 1;
      const income  = rows.find((r) => r._id.month === month && r._id.type === "income")?.total  || 0;
      const expense = rows.find((r) => r._id.month === month && r._id.type === "expense")?.total || 0;
      return {
        month:   String(month).padStart(2, "0"),
        year:    String(year),
        income,
        expense,
        net:     income - expense,
      };
    });

    return res.json({ year: String(year), trends });
  } catch (err) { next(err); }
}

// ── Weekly Trends (last 12 weeks) ─────────────────────────────────────────────
async function weeklyTrends(_req, res, next) {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 84); // 12 weeks back

    const rows = await FinancialRecord.aggregate([
      { $match: { deletedAt: null, date: { $gte: since } } },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: "$date" },
            week: { $isoWeek:     "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } },
    ]);

    // Merge income + expense into same week object
    const map = {};
    for (const row of rows) {
      const key = `${row._id.year}-W${String(row._id.week).padStart(2, "0")}`;
      if (!map[key]) map[key] = { week: key, income: 0, expense: 0 };
      map[key][row._id.type] = row.total;
    }

    const weekly_trends = Object.values(map).map((w) => ({
      ...w, net: w.income - w.expense,
    }));

    return res.json({ weekly_trends });
  } catch (err) { next(err); }
}

// ── Recent Activity ───────────────────────────────────────────────────────────
async function recentActivity(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit || "10", 10), 50);

    const records = await FinancialRecord.find({ deletedAt: null })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .limit(limit);

    const recent = records.map((r) => ({
      id:        r._id,
      amount:    r.amount,
      type:      r.type,
      category:  r.category,
      date:      r.date,
      notes:     r.notes,
      createdAt: r.createdAt,
      createdBy: r.userId?.name ?? "Unknown",
    }));

    return res.json({ recent });
  } catch (err) { next(err); }
}

// ── Top Categories ────────────────────────────────────────────────────────────
async function topCategories(req, res, next) {
  try {
    const type  = req.query.type  || "expense";
    const limit = Math.min(parseInt(req.query.limit || "5", 10), 20);

    if (!["income", "expense"].includes(type))
      return res.status(422).json({ error: "type must be 'income' or 'expense'." });

    const top_categories = await FinancialRecord.aggregate([
      { $match: { deletedAt: null, type } },
      { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: limit },
      { $project: { _id: 0, category: "$_id", total: 1, count: 1 } },
    ]);

    return res.json({ type, top_categories });
  } catch (err) { next(err); }
}

// ── Audit Logs (admin only) ───────────────────────────────────────────────────
async function auditLogs(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const [logs, total] = await Promise.all([
      AuditLog.find()
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(),
    ]);

    return res.json({ data: logs, pagination: buildPaginationMeta(page, limit, total) });
  } catch (err) { next(err); }
}

module.exports = {
  summary,
  byCategory,
  monthlyTrends,
  weeklyTrends,
  recentActivity,
  topCategories,
  auditLogs,
};
