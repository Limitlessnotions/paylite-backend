const { db } = require("../services/firebase");

/**
 * GET /admin-api/pending-vouchers
 * Fetch users with pending vouchers
 */
exports.getPendingVouchers = async (req, res) => {
  try {
    const snapshot = await db
      .collection("users")
      .where("voucherStatus", "==", "pending")
      .orderBy("voucherRequestedAt", "desc")
      .get();

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error("Fetch pending vouchers error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch pending vouchers"
    });
  }
};

/**
 * POST /admin-api/approve-voucher
 */
exports.approveVoucher = async (req, res) => {
  try {
    const { phone } = req.body;

    const snapshot = await db
      .collection("users")
      .where("phone", "==", phone)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const userRef = snapshot.docs[0].ref;

    await userRef.update({
      voucherStatus: "approved",
      approvedAt: new Date(),
      stage: "active"
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Approve voucher error:", err);
    res.status(500).json({ success: false, error: "Approval failed" });
  }
};

/**
 * POST /admin-api/reject-voucher
 */
exports.rejectVoucher = async (req, res) => {
  try {
    const { phone } = req.body;

    const snapshot = await db
      .collection("users")
      .where("phone", "==", phone)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    await snapshot.docs[0].ref.update({
      voucherStatus: "rejected",
      rejectedAt: new Date()
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Reject voucher error:", err);
    res.status(500).json({ success: false, error: "Rejection failed" });
  }
};

/**
 * GET /admin-api/screenings
 */
exports.getScreenings = async (req, res) => {
  try {
    const snapshot = await db
      .collection("screenings")
      .orderBy("createdAt", "desc")
      .get();

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error("Fetch screenings error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch screenings"
    });
  }
};

/**
 * GET /admin-api/audit-logs
 * (Optional – keep if already implemented)
 */
exports.getAuditLogs = async (req, res) => {
  res.json({ success: true, data: [] });
};
