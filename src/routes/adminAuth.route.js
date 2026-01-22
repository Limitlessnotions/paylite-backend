const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

// TEMP in-memory admin lookup (until unified admin service)
const admins = [
  {
    email: "owner@paylite.com",
    passwordHash: "$2a$12$Bl.oaRC51VH4OOD3OP1BGO.fBWvD5zTZFPYDjrEdNYzvcit1V3qc5q", // Admin123
    role: "super_admin"
  }
];

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const admin = admins.find(a => a.email === email);
  if (!admin) {
    return res.status(401).json({ success: false, error: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, admin.passwordHash);
  if (!match) {
    return res.status(401).json({ success: false, error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );

  res.json({ success: true, token });
});

module.exports = router;
