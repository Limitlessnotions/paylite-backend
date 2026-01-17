const { getUserByPhone, updateUser } = require("../services/userService");

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

    return res.json({
      success: true,
      message: "Voucher approved successfully"
    });

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
    const { phone, reason = "Not specified" } = req.body;

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

    return res.json({
      success: true,
      message: "Voucher rejected"
    });

  } catch (error) {
    console.error("rejectVoucher error:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

module.exports = {
  approveVoucher,
  rejectVoucher
};
