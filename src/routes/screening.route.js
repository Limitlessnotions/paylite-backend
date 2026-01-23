const express = require("express");
const router = express.Router();
const { submitScreening } = require("../controllers/screeningController");

router.post("/submit", submitScreening);

module.exports = router;
