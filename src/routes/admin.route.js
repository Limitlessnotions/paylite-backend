const express = require("express");
const router = express.Router();

const {
  getPendingVouchers,
  approveVoucher,
  rejectVoucher,
  getAuditLogs
} = require("../controllers/adminController");

// Admin token guard
router.use((req, res, next) => {
  const token = req.headers["x-admin-token"];
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
  next();
});

router.get("/pending-vouchers", getPendingVouchers);
router.post("/approve-voucher", approveVoucher);
router.post("/reject-voucher", rejectVoucher);
router.get("/audit-logs", getAuditLogs);

module.exports = router;
