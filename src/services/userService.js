// src/services/userService.js
const { db } = require("./firebase");

async function getUserByPhone(phone) {
  try {
    if (!phone) return null;
    const ref = db.collection("users").doc(phone);
    const snap = await ref.get();
    if (!snap.exists) return null;
    return { phone: snap.id, ...snap.data() };
  } catch (e) {
    console.error("getUserByPhone error:", e);
    return null;
  }
}

async function createUser(data) {
  if (!data?.phone) return;
  await db.collection("users").doc(data.phone).set(data, { merge: true });
}

async function updateUser(phone, data) {
  if (!phone) return;
  await db.collection("users").doc(phone).set(data, { merge: true });
}

module.exports = { getUserByPhone, createUser, updateUser };
