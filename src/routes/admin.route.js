const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// HTML dashboard
router.get("/", adminController.getDashboard);

// JSON APIs
router.get("/api/users", adminController.getUsers);
router.get("/api/vouchers", adminController.getVouchers);
router.get("/api/repayments", adminController.getRepayments);

module.exports = router;
