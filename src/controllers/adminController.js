const { getUserByPhone, updateUser } = require("../services/userService");
const { logAudit } = require("../services/auditService");
const { sendWhatsAppMessage } = require("../services/whatsapp.service");
const { fulfillElectricity } = require("../services/fulfillmentService");
const { db } = require("../services/firebase");

// ==========================
// GET PENDING VOUCHERS
// ==========================
async function getPendingVouchers(req, res) {
  try {
    const snapshot = await db
      .collection("users")
      .where("voucherStatus", "==", "pending")
      .get();

    const data = [];

    snapshot.forEach(doc => {
      const u = doc.data();
      data.push({
        phone: doc.id,
        voucherAmount: u.voucherAmount,
        repaymentOption: u.repaymentOption,
        voucherStatus: u.voucherStatus,
        voucherRequestedAt: u.voucherRequestedAt || null
      });
    });

    return res.json({ success: true, data });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false });
  }
}

// ==========================
// APPROVE VOUCHER
// ==========================
async function approveVoucher(req, res) {
  try {
    const { phone } = req.body;
    const user = await getUserByPhone(phone);

    if (!user || user.voucherStatus !== "pending") {
      return res.status(400).json({ success: false });
    }

    await updateUser(phone, {
      voucherStatus: "approved",
      hasActiveVoucher: true
    });

    await logAudit({
      action: "APPROVE_VOUCHER",
      phone,
      timestamp: new Date()
    });

    await sendWhatsAppMessage(
      phone,
      "✅ Your Paylite voucher has been approved. Please reply with your meter number."
    );

    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
}

// ==========================
// REJECT VOUCHER
// ==========================
async function rejectVoucher(req, res) {
  try {
    const { phone, reason } = req.body;

    await updateUser(phone, {
      voucherStatus: "rejected",
      rejectionReason: reason || "Rejected"
    });

    await logAudit({
      action: "REJECT_VOUCHER",
      phone,
      reason,
      timestamp: new Date()
    });

    await sendWhatsAppMessage(
      phone,
      `❌ Your Paylite voucher request was rejected.\nReason: ${reason}`
    );

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false });
  }
}

// ==========================
// BLOCK / UNBLOCK USER
// ==========================
async function blockUser(req, res) {
  await updateUser(req.body.phone, { isBlocked: true });

  await logAudit({
    action: "BLOCK_USER",
    phone: req.body.phone,
    timestamp: new Date()
  });

  res.json({ success: true });
}

async function unblockUser(req, res) {
  await updateUser(req.body.phone, { isBlocked: false });

  await logAudit({
    action: "UNBLOCK_USER",
    phone: req.body.phone,
    timestamp: new Date()
  });

  res.json({ success: true });
}

// ==========================
// FULFILL ELECTRICITY
// ==========================
async function fulfillVoucher(req, res) {
  try {
    const { phone } = req.body;
    const user = await getUserByPhone(phone);

    if (!user || user.fulfillmentStatus !== "pending") {
      return res.status(400).json({ success: false });
    }

    const result = await fulfillElectricity({
      meterNumber: user.meterNumber,
      amount: user.voucherAmount,
      reference: phone
    });

    await updateUser(phone, {
      fulfillmentStatus: "completed",
      electricityToken: result.token
    });

    await logAudit({
      action: "FULFILL_VOUCHER",
      phone,
      timestamp: new Date()
    });

    await sendWhatsAppMessage(
      phone,
      `⚡ Electricity loaded successfully.\nToken:\n${result.token}`
    );

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false });
  }
}

// ==========================
// GET AUDIT LOGS
// ==========================
async function getAuditLogs(req, res) {
  try {
    const snapshot = await db
      .collection("audit_logs")
      .orderBy("timestamp", "desc")
      .limit(50)
      .get();

    const logs = [];
    snapshot.forEach(doc => logs.push(doc.data()));

    res.json({ success: true, data: logs });
  } catch (e) {
    console.error("getAuditLogs error:", e);
    res.status(500).json({ success: false });
  }
}

module.exports = {
  getPendingVouchers,
  approveVoucher,
  rejectVoucher,
  blockUser,
  unblockUser,
  fulfillVoucher,
  getAuditLogs
};
