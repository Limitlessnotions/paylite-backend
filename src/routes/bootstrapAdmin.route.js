const express = require("express");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { db } = require("../services/firebase");

const router = express.Router();

// ⚠️ TEMPORARY — REMOVE AFTER USE
router.post("/create-admin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const snapshot = await db
      .collection("admins")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      return res.status(400).json({ error: "Admin already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.collection("admins").doc(uuidv4()).set({
      email,
      passwordHash,
      role: "super_admin",
      isActive: true,
      createdAt: new Date()
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create admin" });
  }
});

module.exports = router;
