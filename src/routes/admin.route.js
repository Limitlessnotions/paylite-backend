const express = require("express");
const router = express.Router();
const { approveVoucher, rejectVoucher } = require("../controllers/adminController");

// Approve voucher
router.post("/approve-voucher", approveVoucher);

// Reject voucher
router.post("/reject-voucher", rejectVoucher);

module.exports = router;
