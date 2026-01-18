const { db } = require("./firebase");

function normalizePhone(phone) {
  if (!phone) return null;
  return String(phone).trim();
}

async function getUserByPhone(phone) {
  try {
    const safePhone = normalizePhone(phone);
    if (!safePhone) return null;

    const ref = db.collection("users").doc(safePhone);
    const snap = await ref.get();

    if (!snap.exists) return null;

    return { phone: safePhone, ...snap.data() };
  } catch (e) {
    console.error("getUserByPhone error:", e);
    return null;
  }
}

async function createUser(data) {
  try {
    const safePhone = normalizePhone(data?.phone);
    if (!safePhone) {
      console.error("createUser blocked: invalid phone", data);
      return;
    }

    await db.collection("users").doc(safePhone).set(
      {
        ...data,
        phone: safePhone,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { merge: true }
    );
  } catch (e) {
    console.error("createUser error:", e);
  }
}

async function updateUser(phone, data) {
  try {
    const safePhone = normalizePhone(phone);
    if (!safePhone) {
      console.error("updateUser blocked: invalid phone", phone);
      return;
    }

    await db.collection("users").doc(safePhone).set(
      {
        ...data,
        updatedAt: new Date()
      },
      { merge: true }
    );
  } catch (e) {
    console.error("updateUser error:", e);
  }
}

module.exports = {
  getUserByPhone,
  createUser,
  updateUser
};
