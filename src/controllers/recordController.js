/**
 * src/controllers/recordController.js
 */

const FinancialRecord = require("../models/FinancialRecord");
const audit           = require("../utils/audit");
const { parsePagination, buildPaginationMeta } = require("../utils/paginate");
const { NotFoundError, ForbiddenError } = require("../utils/AppError");

// ── List Records ──────────────────────────────────────────────────────────────
async function listRecords(req, res, next) {
  try {
    const { type, category, start_date, end_date, search } = req.query;
    const { page, limit, skip } = parsePagination(req.query);

    // Build query filter
    const filter = { deletedAt: null };

    if (type)       filter.type     = type;
    if (category)   filter.category = { $regex: category, $options: "i" };
    if (start_date || end_date) {
      filter.date = {};
      if (start_date) filter.date.$gte = new Date(start_date);
      if (end_date)   filter.date.$lte = new Date(end_date);
    }
    if (search) {
      filter.$or = [
        { category: { $regex: search, $options: "i" } },
        { notes:    { $regex: search, $options: "i" } },
      ];
    }

    const [records, total] = await Promise.all([
      FinancialRecord.find(filter)
        .populate("userId", "name email")   // join user info
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      FinancialRecord.countDocuments(filter),
    ]);

    // Reshape for cleaner API response
    const data = records.map((r) => ({
      id:         r._id,
      amount:     r.amount,
      type:       r.type,
      category:   r.category,
      date:       r.date,
      notes:      r.notes,
      createdAt:  r.createdAt,
      updatedAt:  r.updatedAt,
      createdBy:  r.userId?.name ?? "Unknown",
    }));

    return res.json({ data, pagination: buildPaginationMeta(page, limit, total) });
  } catch (err) { next(err); }
}

// ── Get Single Record ─────────────────────────────────────────────────────────
async function getRecord(req, res, next) {
  try {
    const record = await FinancialRecord.findOne({
      _id: req.params.id,
      deletedAt: null,
    }).populate("userId", "name email");

    if (!record) throw new NotFoundError("Financial record");

    return res.json({
      record: {
        id:        record._id,
        amount:    record.amount,
        type:      record.type,
        category:  record.category,
        date:      record.date,
        notes:     record.notes,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        createdBy: record.userId?.name ?? "Unknown",
      },
    });
  } catch (err) { next(err); }
}

// ── Create Record ─────────────────────────────────────────────────────────────
async function createRecord(req, res, next) {
  try {
    const { amount, type, category, date, notes } = req.body;

    const record = await FinancialRecord.create({
      userId:   req.user._id,
      amount,
      type,
      category,
      date:     new Date(date),
      notes:    notes ?? null,
    });

    audit.log({
      userId:   req.user._id,
      action:   "CREATE_RECORD",
      entity:   "financial_record",
      entityId: record._id,
      details:  { amount, type, category, date },
      ip:       req.ip,
    });

    return res.status(201).json({ message: "Record created.", record });
  } catch (err) { next(err); }
}

// ── Update Record ─────────────────────────────────────────────────────────────
async function updateRecord(req, res, next) {
  try {
    const record = await FinancialRecord.findOne({
      _id: req.params.id,
      deletedAt: null,
    });

    if (!record) throw new NotFoundError("Financial record");

    // Analysts may only modify their own records
    if (req.user.role === "analyst" && record.userId.toString() !== req.user._id.toString())
      throw new ForbiddenError("Analysts can only update their own records.");

    const { amount, type, category, date, notes } = req.body;
    if (amount   !== undefined) record.amount   = amount;
    if (type     !== undefined) record.type     = type;
    if (category !== undefined) record.category = category;
    if (date     !== undefined) record.date     = new Date(date);
    if (notes    !== undefined) record.notes    = notes;

    await record.save();

    audit.log({
      userId:   req.user._id,
      action:   "UPDATE_RECORD",
      entity:   "financial_record",
      entityId: record._id,
      details:  { fields: Object.keys(req.body) },
      ip:       req.ip,
    });

    return res.json({ message: "Record updated.", record });
  } catch (err) { next(err); }
}

// ── Soft Delete Record ────────────────────────────────────────────────────────
async function deleteRecord(req, res, next) {
  try {
    const record = await FinancialRecord.findOne({
      _id: req.params.id,
      deletedAt: null,
    });

    if (!record) throw new NotFoundError("Financial record");

    if (req.user.role === "analyst" && record.userId.toString() !== req.user._id.toString())
      throw new ForbiddenError("Analysts can only delete their own records.");

    record.deletedAt = new Date();
    await record.save();

    audit.log({
      userId:   req.user._id,
      action:   "DELETE_RECORD",
      entity:   "financial_record",
      entityId: record._id,
      ip:       req.ip,
    });

    return res.json({ message: "Record deleted (soft delete)." });
  } catch (err) { next(err); }
}

module.exports = { listRecords, getRecord, createRecord, updateRecord, deleteRecord };
