const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { db } = require("../services/firebase");

async function loginAdmin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password required"
      });
    }

    const snapshot = await db
      .collection("admins")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }

    const doc = snapshot.docs[0];
    const admin = doc.data();

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        adminId: doc.id,
        email: admin.email,
        role: admin.role || "admin"
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    return res.json({
      success: true,
      token
    });

  } catch (err) {
    console.error("loginAdmin error:", err);
    return res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
}

module.exports = { loginAdmin };
