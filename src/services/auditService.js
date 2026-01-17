const { db } = require("./firebase");

const AUDIT_COLLECTION = "audit_logs";

async function logAudit({
  action,
  phone,
  performedBy,
  reason = null,
  metadata = {}
}) {
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
}

module.exports = { logAudit };
