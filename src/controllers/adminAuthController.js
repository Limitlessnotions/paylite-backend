const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { db } = require("../services/firebase");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "12h";

// =========================
// ADMIN LOGIN
// =========================
async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password required" });
    }

    const snapshot = await db
      .collection("admins")
      .where("email", "==", email)
      .where("isActive", "==", true)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const adminDoc = snapshot.docs[0];
    const admin = adminDoc.data();

    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        adminId: adminDoc.id,
        email: admin.email,
        role: admin.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    await adminDoc.ref.update({
      lastLoginAt: new Date()
    });

    return res.json({
      success: true,
      token
    });

  } catch (err) {
    console.error("adminLogin error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}

module.exports = { adminLogin };
