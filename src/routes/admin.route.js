const express = require("express");
const router = express.Router();

// IMPORTANT:
// adminJwt exports the middleware function directly
// NOT { requireAdmin }
const requireAdmin = require("../middleware/adminJwt");

const {
  getPendingVouchers,
  approveVoucher,
  rejectVoucher,
  getAuditLogs,
  getScreenings
} = require("../controllers/adminController");

// 🔐 Protect ALL admin routes
router.use(requireAdmin);

// ===== VOUCHERS =====
router.get("/pending-vouchers", getPendingVouchers);
router.post("/approve-voucher", approveVoucher);
router.post("/reject-voucher", rejectVoucher);

// ===== AUDIT LOGS =====
router.get("/audit-logs", getAuditLogs);

// ===== SCREENING (M3-2) =====
router.get("/screenings", getScreenings);

module.exports = router;
