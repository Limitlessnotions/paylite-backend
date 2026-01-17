const express = require("express");
const router = express.Router();

const {
  approveVoucher,
  rejectVoucher,
  blockUser,
  unblockUser
} = require("../controllers/adminController");

// Voucher approval
router.post("/approve-voucher", approveVoucher);
router.post("/reject-voucher", rejectVoucher);

// User control
router.post("/block-user", blockUser);
router.post("/unblock-user", unblockUser);

module.exports = router;
