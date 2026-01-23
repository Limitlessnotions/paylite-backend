// src/controllers/screeningController.js
const { db } = require("../services/firebase");

/**
 * POST /screening/submit
 */
async function submitScreening(req, res) {
  try {
    const {
      phone,
      fullName,
      idNumber,
      employed,
      monthlyIncome,
      consent
    } = req.body;

    // ===== Basic validation =====
    if (
      !phone ||
      !fullName ||
      !idNumber ||
      employed === undefined ||
      !monthlyIncome ||
      consent !== true
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing or invalid fields"
      });
    }

    // SA ID must be 13 digits
    if (!/^\d{13}$/.test(idNumber)) {
      return res.status(400).json({
        success: false,
        error: "Invalid South African ID number"
      });
    }

    // ===== Screening rules (VERY SIMPLE FOR NOW) =====
    let status = "pending";

    if (employed === true && Number(monthlyIncome) >= 3000) {
      status = "approved";
    }

    if (employed === false || Number(monthlyIncome) < 3000) {
      status = "declined";
    }

    const record = {
      phone,
      fullName,
      idNumber,
      employed,
      monthlyIncome: Number(monthlyIncome),
      consent,
      status,
      createdAt: new Date()
    };

    await db.collection("screenings").doc(phone).set(record);

    return res.json({
      success: true,
      status
    });
  } catch (err) {
    console.error("Screening submit error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
}

module.exports = {
  submitScreening
};
