const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");

const {
  getPendingVouchers,
  approveVoucher,
  rejectVoucher,
  blockUser,
  unblockUser,
  fulfillVoucher,
  getAuditLogs
} = require("../controllers/adminController");

// 🔐 Protect all admin routes
router.use(adminAuth);

router.get("/pending-vouchers", getPendingVouchers);
router.get("/audit-logs", getAuditLogs);

router.post("/approve-voucher", approveVoucher);
router.post("/reject-voucher", rejectVoucher);
router.post("/block-user", blockUser);
router.post("/unblock-user", unblockUser);
router.post("/fulfill-voucher", fulfillVoucher);

module.exports = router;
