/**
 * src/utils/audit.js
 * ───────────────────
 * Writes an immutable audit trail entry after every mutating action.
 * Failures are swallowed — they must never crash the main request.
 */

const AuditLog = require("../models/AuditLog");

async function log({ userId = null, action, entity, entityId = null, details = null, ip = null }) {
  try {
    await AuditLog.create({ userId, action, entity, entityId, details, ipAddress: ip });
  } catch (err) {
    console.error("[audit] Write failed:", err.message);
  }
}

module.exports = { log };
