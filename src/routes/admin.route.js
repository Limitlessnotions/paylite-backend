const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/adminJwt");

const {
  getPendingVouchers,
  approveVoucher,
  rejectVoucher,
  getAuditLogs
} = require("../controllers/adminController");

// 🔐 JWT admin protection (REPLACES x-admin-token)
router.use(requireAdmin);

router.get("/pending-vouchers", getPendingVouchers);
router.post("/approve-voucher", approveVoucher);
router.post("/reject-voucher", rejectVoucher);
router.get("/audit-logs", getAuditLogs);

module.exports = router;
