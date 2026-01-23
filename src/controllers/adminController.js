const { db } = require("../services/firebase");

// ===== Pending vouchers =====
exports.getPendingVouchers = async (req, res) => {
  try {
    const snapshot = await db
      .collection("vouchers")
      .where("status", "==", "pending")
      .get();

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to fetch vouchers" });
  }
};

// ===== Approve voucher =====
exports.approveVoucher = async (req, res) => {
  const { phone } = req.body;

  try {
    const snap = await db
      .collection("vouchers")
      .where("phone", "==", phone)
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(404).json({ success: false });
    }

    await snap.docs[0].ref.update({ status: "approved" });

    await db.collection("auditLogs").add({
      phone,
      action: "approved",
      timestamp: new Date()
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// ===== Reject voucher =====
exports.rejectVoucher = async (req, res) => {
  const { phone } = req.body;

  try {
    const snap = await db
      .collection("vouchers")
      .where("phone", "==", phone)
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(404).json({ success: false });
    }

    await snap.docs[0].ref.update({ status: "rejected" });

    await db.collection("auditLogs").add({
      phone,
      action: "rejected",
      timestamp: new Date()
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// ===== Audit logs =====
exports.getAuditLogs = async (req, res) => {
  try {
    const snapshot = await db
      .collection("auditLogs")
      .orderBy("timestamp", "desc")
      .limit(50)
      .get();

    const data = snapshot.docs.map(d => d.data());

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// ===== M3-2: Get screening submissions =====
exports.getScreenings = async (req, res) => {
  try {
    const snapshot = await db
      .collection("screenings")
      .orderBy("createdAt", "desc")
      .get();

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};
