/**
 * src/config/seed.js
 * ───────────────────
 * Populates MongoDB with default users and realistic sample financial records.
 *
 * Run:  npm run seed
 * Safe to re-run — existing users are skipped via upsert, records are cleared and re-inserted.
 */

require("dotenv").config();
const bcrypt          = require("bcryptjs");
const { connectDB }   = require("./database");
const User            = require("../models/User");
const FinancialRecord = require("../models/FinancialRecord");

const USERS = [
  { name: "Super Admin",   email: "admin@finance.dev",   password: "Admin@1234",   role: "admin"   },
  { name: "Alice Analyst", email: "analyst@finance.dev", password: "Analyst@1234", role: "analyst" },
  { name: "Victor Viewer", email: "viewer@finance.dev",  password: "Viewer@1234",  role: "viewer"  },
];

function rand(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function generateRecords(userId, year) {
  const records = [];
  for (let month = 1; month <= 6; month++) {
    const mm  = String(month).padStart(2, "0");
    const day = (d) => new Date(`${year}-${mm}-${String(d).padStart(2, "0")}`);

    // Income
    records.push({ userId, amount: 85000,             type: "income",  category: "Salary",     date: day(1),  notes: "Monthly salary credit" });
    records.push({ userId, amount: rand(10000, 55000), type: "income",  category: "Freelance",  date: day(10), notes: "Client project payment" });
    if (month % 2 === 0)
      records.push({ userId, amount: rand(5000, 22000), type: "income",  category: "Investment", date: day(14), notes: "Dividend income" });

    // Expenses
    records.push({ userId, amount: 12000,             type: "expense", category: "Rent",       date: day(3),  notes: "Monthly office rent" });
    records.push({ userId, amount: rand(2000, 5000),  type: "expense", category: "Utilities",  date: day(5),  notes: "Electricity & internet" });
    records.push({ userId, amount: rand(4000, 9000),  type: "expense", category: "Groceries",  date: day(15), notes: "Monthly groceries" });
    records.push({ userId, amount: rand(500,  3000),  type: "expense", category: "Software",   date: day(20), notes: "SaaS subscriptions" });
    if (month % 3 === 0) {
      records.push({ userId, amount: rand(3000, 12000), type: "expense", category: "Travel",    date: day(22), notes: "Business travel" });
      records.push({ userId, amount: rand(1000, 8000),  type: "expense", category: "Marketing", date: day(25), notes: "Digital ad spend" });
    }
    if (month % 4 === 0)
      records.push({ userId, amount: rand(1500, 6000),  type: "expense", category: "Healthcare",date: day(18), notes: "Health insurance" });
  }
  return records;
}

async function seed() {
  await connectDB();
  console.log("\n🌱  Seeding MongoDB...\n");

  // ── Users ────────────────────────────────────────────────────────────────────
  const userIds = {};
  for (const u of USERS) {
    const passwordHash = await bcrypt.hash(u.password, 12);

    // upsert: create if not exists, skip if exists
    const user = await User.findOneAndUpdate(
      { email: u.email },
      { $setOnInsert: { name: u.name, email: u.email, passwordHash, role: u.role, status: "active" } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    userIds[u.role] = user._id;
    console.log(`  ✓ [${u.role.padEnd(7)}]  ${u.email}   /   ${u.password}`);
  }

  // ── Financial Records ─────────────────────────────────────────────────────────
  // Clear existing sample records (for clean re-seeding)
  await FinancialRecord.deleteMany({ userId: userIds.admin });

  const year    = new Date().getFullYear();
  const records = generateRecords(userIds.admin, year);
  await FinancialRecord.insertMany(records);

  console.log(`\n  ✓ Inserted ${records.length} sample financial records (year ${year})\n`);
  console.log("━".repeat(58));
  console.log("✅  Seeding complete!\n");
  console.log("  Admin    →  admin@finance.dev    /  Admin@1234");
  console.log("  Analyst  →  analyst@finance.dev  /  Analyst@1234");
  console.log("  Viewer   →  viewer@finance.dev   /  Viewer@1234");
  console.log("━".repeat(58) + "\n");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err.message);
  process.exit(1);
});
