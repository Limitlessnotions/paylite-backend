const { db } = require("../services/firebase");

// =========================
// GET PENDING VOUCHERS
// =========================
async function getPendingVouchers(req, res) {
  try {
    const snapshot = await db
      .collection("users")
      .where("voucherStatus", "==", "pending")
      .get();

    const results = [];

    snapshot.forEach(doc => {
      const data = doc.data();

      results.push({
        phone: doc.id,
        meterNumber: data.meterNumber || null,
        meterSupplier: data.meterSupplier || null,
        voucherAmount: data.voucherAmount,
        repaymentOption: data.repaymentOption,
        requestedAt: data.voucherRequestedAt || null
      });
    });

    return res.json({ success: true, data: results });
  } catch (err) {
    console.error("getPendingVouchers error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}

// =========================
// APPROVE VOUCHER
// =========================
async function approveVoucher(req, res) {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, error: "Phone required" });
    }

    await db.collection("users").doc(phone).update({
      voucherStatus: "approved",
      hasActiveVoucher: true,
      approvedAt: new Date()
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("approveVoucher error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}

// =========================
// REJECT VOUCHER
// =========================
async function rejectVoucher(req, res) {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, error: "Phone required" });
    }

    await db.collection("users").doc(phone).update({
      voucherStatus: "rejected",
      rejectedAt: new Date()
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("rejectVoucher error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}

// =========================
// GET AUDIT LOGS
// =========================
async function getAuditLogs(req, res) {
  try {
    const snapshot = await db
      .collection("audit_logs")
      .orderBy("timestamp", "desc")
      .limit(50)
      .get();

    const logs = [];
    snapshot.forEach(doc => logs.push(doc.data()));

    return res.json({ success: true, data: logs });
  } catch (err) {
    console.error("getAuditLogs error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}

// =========================
// EXPORTS (THIS IS CRITICAL)
// =========================
module.exports = {
  getPendingVouchers,
  approveVoucher,
  rejectVoucher,
  getAuditLogs
};
