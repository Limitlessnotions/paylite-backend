// src/services/userService.js
const { db } = require("./firebase");

// ==========================
// GET USER BY PHONE
// ==========================
async function getUserByPhone(phone) {
  try {
    if (!phone || typeof phone !== "string" || !phone.trim()) {
      return null;
    }

    const ref = db.collection("users").doc(phone.trim());
    const snap = await ref.get();

    if (!snap.exists) return null;

    return {
      phone: snap.id,
      ...snap.data()
    };
  } catch (e) {
    console.error("getUserByPhone error:", e);
    return null;
  }
}

// ==========================
// CREATE USER (HARDENED)
// ==========================
async function createUser(data) {
  try {
    if (
      !data ||
      !data.phone ||
      typeof data.phone !== "string" ||
      !data.phone.trim()
    ) {
      console.warn("createUser skipped: invalid phone", data?.phone);
      return;
    }

    await db
      .collection("users")
      .doc(data.phone.trim())
      .set(data, { merge: true });
  } catch (e) {
    console.error("createUser error:", e);
  }
}

// ==========================
// UPDATE USER (HARDENED)
// ==========================
async function updateUser(phone, data) {
  try {
    if (!phone || typeof phone !== "string" || !phone.trim()) {
      console.warn("updateUser skipped: invalid phone", phone);
      return;
    }

    await db
      .collection("users")
      .doc(phone.trim())
      .set(data, { merge: true });
  } catch (e) {
    console.error("updateUser error:", e);
  }
}

module.exports = {
  getUserByPhone,
  createUser,
  updateUser
};
