const { db } = require("../services/firebase");

/**
 * POST /screening/submit
 */
async function submitScreening(req, res) {
  try {
    const { fullName, idNumber, employed, income } = req.body;

    // 1️⃣ Hard validation
    if (!fullName || !idNumber || !employed || !income) {
      return res.status(400).json({
        success: false,
        error: "All fields are required"
      });
    }

    if (!/^\d{13}$/.test(idNumber)) {
      return res.status(400).json({
        success: false,
        error: "Invalid SA ID number"
      });
    }

    // 2️⃣ Decision rules (FAST & CLEAR)
    let decision = "rejected";
    let reason = "Does not meet requirements";

    if (employed === "yes" && Number(income) >= 1000) {
      decision = "approved";
      reason = "Meets basic income requirements";
    }

    // 3️⃣ Save screening result
    const record = {
      fullName,
      idNumber,
      employed,
      income: Number(income),
      decision,
      reason,
      createdAt: new Date()
    };

    await db.collection("screenings").add(record);

    // 4️⃣ Respond
    if (decision === "approved") {
      return res.json({
        success: true,
        decision,
        message:
          "You are pre-approved ✅ Please return to WhatsApp to continue."
      });
    }

    return res.json({
      success: true,
      decision,
      message:
        "Unfortunately, you do not qualify at this time ❌"
    });

  } catch (err) {
    console.error("Screening error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
}

module.exports = { submitScreening };
