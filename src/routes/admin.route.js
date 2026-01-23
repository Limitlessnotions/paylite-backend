const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/adminJwt");

const {
  getPendingVouchers,
  approveVoucher,
  rejectVoucher,
  getAuditLogs,
  getScreenings
} = require("../controllers/adminController");

// 🔐 Protect everything
router.use(requireAdmin);

// Voucher management
router.get("/pending-vouchers", getPendingVouchers);
router.post("/approve-voucher", approveVoucher);
router.post("/reject-voucher", rejectVoucher);

// Audit
router.get("/audit-logs", getAuditLogs);

// ===== M3-2: Screening results =====
router.get("/screenings", getScreenings);

module.exports = router;
