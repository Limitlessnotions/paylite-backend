const express = require("express");
const router = express.Router();
const {requireAdmin} = require("../middleware/adminJwt");

const {
  getPendingVouchers,
  approveVoucher,
  rejectVoucher,
  getScreenings,
  getAuditLogs
} = require("../controllers/adminController");

// 🔐 Protect all admin routes
router.use(requireAdmin);

router.get("/pending-vouchers", getPendingVouchers);
router.post("/approve-voucher", approveVoucher);
router.post("/reject-voucher", rejectVoucher);

router.get("/screenings", getScreenings);
router.get("/audit-logs", getAuditLogs);

module.exports = router;
