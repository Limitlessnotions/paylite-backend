const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

/**
 * TEMPORARY IN-MEMORY ADMIN STORE
 * (Later this will come from Firestore)
 */
const admins = [
  {
    email: "owner@paylite.com",
    passwordHash:
      "$2a$10$Iprl5zWyOiv9ujoBxM6qPudkx/GeJXL.tT5KrQpQ1eW2S3318MbWO",
    role: "super_admin",
    isActive: true
  }
];

/**
 * POST /admin-auth/login
 * Admin login → returns JWT
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password required"
      });
    }

    const admin = admins.find(a => a.email === email);

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }

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
    console.error("Admin login error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

module.exports = router;
