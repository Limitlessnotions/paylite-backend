const express = require("express");
const router = express.Router();

const {
  getPendingVouchers,
  approveVoucher,
  rejectVoucher,
  blockUser,
  unblockUser,
  fulfillVoucher
} = require("../controllers/adminController");

router.get("/pending-vouchers", getPendingVouchers);
router.post("/approve-voucher", approveVoucher);
router.post("/reject-voucher", rejectVoucher);
router.post("/block-user", blockUser);
router.post("/unblock-user", unblockUser);
router.post("/fulfill-voucher", fulfillVoucher);

module.exports = router;
