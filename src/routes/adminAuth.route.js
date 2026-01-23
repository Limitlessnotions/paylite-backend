const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

/**
 * TEMP ADMIN STORE
 * Password (PLAIN TEXT): Admin123
 * Hash (bcrypt):
 * $2a$10$Iprl5zWyOiv9ujoBxM6qPudkx/GeJXL.tT5KrQpQ1eW2S3318MbWO
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
 * Returns JWT on success
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password required"
      });
    }

    // Find admin
    const admin = admins.find(a => a.email === email);

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }

    // Compare password with hash
    const isMatch = await bcrypt.compare(password, admin.passwordHash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }

    // Create JWT
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
