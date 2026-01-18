const { db } = require("../services/firebase");

async function getPendingVouchers(req, res) {
  const snapshot = await db
    .collection("users")
    .where("voucherStatus", "==", "pending")
    .get();

  const data = [];
  snapshot.forEach(doc => {
    const d = doc.data();
    data.push({
      phone: doc.id,
      voucherAmount: d.voucherAmount,
      repaymentOption: d.repaymentOption,
      requestedAt: d.voucherRequestedAt
    });
  });

  res.json({ success: true, data });
}

async function approveVoucher(req, res) {
  const { phone } = req.body;

  await db.collection("users").doc(phone).update({
    voucherStatus: "approved",
    hasActiveVoucher: true,
    updatedAt: new Date()
  });

  await db.collection("audit_logs").add({
    action: "APPROVED",
    phone,
    timestamp: new Date()
  });

  res.json({ success: true });
}

async function rejectVoucher(req, res) {
  const { phone } = req.body;

  await db.collection("users").doc(phone).update({
    voucherStatus: "rejected",
    updatedAt: new Date()
  });

  await db.collection("audit_logs").add({
    action: "REJECTED",
    phone,
    timestamp: new Date()
  });

  res.json({ success: true });
}

async function getAuditLogs(req, res) {
  const snapshot = await db
    .collection("audit_logs")
    .orderBy("timestamp", "desc")
    .limit(50)
    .get();

  const logs = [];
  snapshot.forEach(doc => logs.push(doc.data()));

  res.json({ success: true, data: logs });
}

module.exports = {
  getPendingVouchers,
  approveVoucher,
  rejectVoucher,
  getAuditLogs
};
