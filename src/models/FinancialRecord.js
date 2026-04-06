/**
 * src/models/FinancialRecord.js
 * ──────────────────────────────
 * Mongoose schema for financial transactions.
 *
 * Fields:
 *   userId     — reference to the User who created the record
 *   amount     — positive number
 *   type       — "income" | "expense"
 *   category   — e.g. "Salary", "Rent", "Freelance"
 *   date       — the transaction date (Date object)
 *   notes      — optional description
 *   deletedAt  — null = active, Date = soft-deleted
 *   createdAt  — auto-managed by timestamps
 *   updatedAt  — auto-managed by timestamps
 */

const { Schema, model, Types } = require("mongoose");

const recordSchema = new Schema(
  {
    userId: {
      type:     Types.ObjectId,
      ref:      "User",
      required: true,
    },
    amount: {
      type:     Number,
      required: [true, "Amount is required."],
      min:      [0.01, "Amount must be greater than 0."],
    },
    type: {
      type:     String,
      required: [true, "Type is required."],
      enum:     ["income", "expense"],
    },
    category: {
      type:     String,
      required: [true, "Category is required."],
      trim:     true,
      maxlength: [100, "Category must not exceed 100 characters."],
    },
    date: {
      type:     Date,
      required: [true, "Date is required."],
    },
    notes: {
      type:     String,
      trim:     true,
      maxlength: [500, "Notes must not exceed 500 characters."],
      default:  null,
    },
    deletedAt: {
      type:    Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common query patterns
recordSchema.index({ userId: 1 });
recordSchema.index({ type: 1 });
recordSchema.index({ category: 1 });
recordSchema.index({ date: -1 });
recordSchema.index({ deletedAt: 1 });
// Compound index for filtered listing queries
recordSchema.index({ deletedAt: 1, type: 1, date: -1 });

module.exports = model("FinancialRecord", recordSchema);
