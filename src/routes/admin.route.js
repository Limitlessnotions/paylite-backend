const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/adminJwt");
const { db } = require("../config/firebase");

const {
  getPendingVouchers,
  approveVoucher,
  rejectVoucher,
  getAuditLogs
} = require("../controllers/adminController");

// 🔐 Protect ALL admin routes
router.use(requireAdmin);

// ===== Voucher Management =====
router.get("/pending-vouchers", getPendingVouchers);
router.post("/approve-voucher", approveVoucher);
router.post("/reject-voucher", rejectVoucher);

// ===== Audit Logs =====
router.get("/audit-logs", getAuditLogs);

// ===== Credit Screenings (M3-2) =====
router.get("/screenings", async (req, res) => {
  try {
    const snapshot = await db
      .collection("screenings")
      .orderBy("createdAt", "desc")
      .get();

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      data
    });
  } catch (err) {
    console.error("Fetch screenings error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch screenings"
    });
  }
});

module.exports = router;
