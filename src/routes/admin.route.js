const express = require("express");
const router = express.Router();

const {
  getScreenings,
  screeningDecision
} = require("../controllers/adminController");

// ===============================
// ADMIN ROUTES
// ===============================
router.get("/screenings", getScreenings);
router.post("/screening-decision", screeningDecision);

module.exports = router;
