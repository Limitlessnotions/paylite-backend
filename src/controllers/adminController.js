const { db } = require("../config/firebase");

// ==============================
// APPROVE SCREENING
// ==============================
async function approveScreening(req, res) {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, error: "Phone required" });
    }

    const ref = db.collection("screenings").doc(phone);

    await ref.set(
      {
        status: "approved",
        reviewedAt: new Date(),
        reviewedBy: req.admin.email
      },
      { merge: true }
    );

    await db.collection("audit_logs").add({
      action: "SCREENING_APPROVED",
      phone,
      admin: req.admin.email,
      timestamp: new Date()
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Approve screening error:", err);
    res.status(500).json({ success: false, error: "Approval failed" });
  }
}

// ==============================
// REJECT SCREENING
// ==============================
async function rejectScreening(req, res) {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, error: "Phone required" });
    }

    const ref = db.collection("screenings").doc(phone);

    await ref.set(
      {
        status: "rejected",
        reviewedAt: new Date(),
        reviewedBy: req.admin.email
      },
      { merge: true }
    );

    await db.collection("audit_logs").add({
      action: "SCREENING_REJECTED",
      phone,
      admin: req.admin.email,
      timestamp: new Date()
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Reject screening error:", err);
    res.status(500).json({ success: false, error: "Rejection failed" });
  }
}

module.exports = {
  // keep existing exports
  approveScreening,
  rejectScreening
};
