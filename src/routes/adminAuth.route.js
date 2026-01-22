const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

const { db } = require("../config/firebase");

router.post("/login", async (req, res) => {
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

    const admin = snapshot.docs[0].data();

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        error: "Admin disabled"
      });
    }

    // ✅ THIS IS THE IMPORTANT PART
    const passwordMatch = await bcrypt.compare(
      password,
      admin.passwordHash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        adminId: snapshot.docs[0].id,
        email: admin.email,
        role: admin.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    return res.json({
      success: true,
      token
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

module.exports = router;
