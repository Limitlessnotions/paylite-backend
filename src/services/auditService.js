const { db } = require("./firebase");

const AUDIT_COLLECTION = "audit_logs";

/**
 * Write an immutable audit log entry
 */
async function logAudit({
  action,
  phone,
  performedBy,
  reason = null,
  metadata = {}
}) {
  try {
    if (!action || !phone || !performedBy) return;

    const payload = {
      action,
      phone,
      performedBy,
      reason,
      metadata,
      createdAt: new Date()
    };

    await db.collection(AUDIT_COLLECTION).add(payload);
  } catch (error) {
    console.error("Audit log error:", error);
  }
}

module.exports = { logAudit };
