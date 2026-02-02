const { db } = require("../services/firebase");

// ===============================
// GET ALL SCREENINGS
// ===============================
exports.getScreenings = async (req, res) => {
  try {
    const snap = await db
      .collection("screenings")
      .orderBy("createdAt", "desc")
      .get();

    const data = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error("Get screenings error:", err);
    res.status(500).json({ success: false });
  }
};

// ===============================
// APPROVE / REJECT SCREENING
// ===============================
exports.screeningDecision = async (req, res) => {
  const { screeningId, decision } = req.body;

  if (!screeningId || !["approved", "rejected"].includes(decision)) {
    return res.status(400).json({ success: false });
  }

  try {
    const screeningRef = db.collection("screenings").doc(screeningId);
    const snap = await screeningRef.get();

    if (!snap.exists) {
      return res.status(404).json({ success: false });
    }

    const screening = snap.data();
    const phone = screening.phone;

    // Update screening record
    await screeningRef.update({
      status: decision,
      decidedAt: new Date()
    });

    // Update user (THIS drives WhatsApp)
    await db.collection("users").doc(phone).set({
      screeningStatus: decision,
      creditApproved: decision === "approved",
      blocked: decision !== "approved",
      updatedAt: new Date()
    }, { merge: true });

    res.json({ success: true });
  } catch (err) {
    console.error("Screening decision error:", err);
    res.status(500).json({ success: false });
  }
};
