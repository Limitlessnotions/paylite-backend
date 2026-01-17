const { getUserByPhone, updateUser } = require("../services/userService");
const { logAudit } = require("../services/auditService");
const { sendWhatsAppMessage } = require("../services/whatsapp.service");

// ==========================
// APPROVE VOUCHER
// ==========================
async function approveVoucher(req, res) {
  try {
    const { phone, approvedBy = "Compliance Officer" } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, error: "Phone is required" });
    }

    const user = await getUserByPhone(phone);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (user.voucherStatus !== "pending") {
      return res.status(400).json({
        success: false,
        error: "Voucher is not pending approval"
      });
    }

    await updateUser(phone, {
      voucherStatus: "approved",
      hasActiveVoucher: true,
      voucherApprovedAt: new Date(),
      approvedBy
    });

    await logAudit({
      action: "APPROVE_VOUCHER",
      phone,
      performedBy: approvedBy,
      metadata: {
        voucherAmount: user.voucherAmount,
        repaymentOption: user.repaymentOption
      }
    });

    // ✅ WHATSAPP NOTIFICATION
    await sendWhatsAppMessage(
      phone,
      `✅ Your Paylite voucher has been approved!\n\nAmount: R${user.voucherAmount}\n\nYou’ll receive next steps shortly.`
    );

    return res.json({ success: true, message: "Voucher approved successfully" });

  } catch (error) {
    console.error("approveVoucher error:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

// ==========================
// REJECT VOUCHER
// ==========================
async function rejectVoucher(req, res) {
  try {
    const { phone, reason = "Rejected by admin" } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, error: "Phone is required" });
    }

    const user = await getUserByPhone(phone);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (user.voucherStatus !== "pending") {
      return res.status(400).json({
        success: false,
        error: "Voucher is not pending approval"
      });
    }

    await updateUser(phone, {
      voucherStatus: "rejected",
      rejectionReason: reason
    });

    await logAudit({
      action: "REJECT_VOUCHER",
      phone,
      performedBy: "Compliance Officer",
      reason
    });

    // ❌ WHATSAPP NOTIFICATION
    await sendWhatsAppMessage(
      phone,
      `❌ Your Paylite voucher request was not approved.\n\nReason: ${reason}\n\nYou may try again later.`
    );

    return res.json({ success: true, message: "Voucher rejected successfully" });

  } catch (error) {
    console.error("rejectVoucher error:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

module.exports = {
  approveVoucher,
  rejectVoucher
};
