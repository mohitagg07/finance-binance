/**
 * src/models/AuditLog.js
 * ────────────────────────
 * Append-only record of every mutating action in the system.
 * No update or delete endpoints exist for this collection.
 *
 * Fields:
 *   userId     — who performed the action (null = anonymous/system)
 *   action     — e.g. "LOGIN", "CREATE_RECORD", "DELETE_USER"
 *   entity     — e.g. "user", "financial_record"
 *   entityId   — the affected document's _id
 *   details    — any extra context (stored as a plain object)
 *   ipAddress  — the requester's IP
 *   createdAt  — when it happened (auto-managed by timestamps)
 */

const { Schema, model, Types } = require("mongoose");

const auditLogSchema = new Schema(
  {
    userId: {
      type:    Types.ObjectId,
      ref:     "User",
      default: null,
    },
    action: {
      type:     String,
      required: true,
    },
    entity: {
      type:     String,
      required: true,
    },
    entityId: {
      type:    Types.ObjectId,
      default: null,
    },
    details: {
      type:    Schema.Types.Mixed,
      default: null,
    },
    ipAddress: {
      type:    String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // only createdAt needed
  }
);

auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = model("AuditLog", auditLogSchema);
