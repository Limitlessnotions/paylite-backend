const { db } = require("../services/firebase");

// GET pending vouchers
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

// APPROVE voucher
async function approveVoucher(req, res) {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ success: false });

  await db.collection("users").doc(phone).update({
    voucherStatus: "approved",
    hasActiveVoucher: true,
    approvedAt: new Date()
  });

  return res.json({ success: true });
}

// REJECT voucher
async function rejectVoucher(req, res) {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ success: false });

  await db.collection("users").doc(phone).update({
    voucherStatus: "rejected",
    rejectedAt: new Date()
  });

  return res.json({ success: true });
}

module.exports = {
  getPendingVouchers,
  approveVoucher,
  rejectVoucher
};
