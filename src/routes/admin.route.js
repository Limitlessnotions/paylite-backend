const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/adminJwt");

const {
  getScreenings,
  screeningDecision
} = require("../controllers/adminController");

// 🔐 Protect all admin routes
router.use(requireAdmin);

// ===== Screening (M3) =====
router.get("/screenings", getScreenings);
router.post("/screening-decision", screeningDecision);

module.exports = router;
