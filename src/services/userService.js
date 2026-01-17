// src/services/userService.js
const { db } = require("./firebase");

const USERS_COLLECTION = "users";

// ==========================
// DEFAULT USER STATE
// ==========================
function defaultUser(phone) {
  const now = new Date();

  return {
    phone,
    stage: "onboarding",

    // Terms
    termsAccepted: false,
    termsAcceptedAt: null,
    termsVersion: "v1.0",

    // Voucher lifecycle
    hasActiveVoucher: false,
    voucherStatus: null, // pending | approved | repaid
    voucherAmount: null,
    voucherRequestedAt: null,

    // Repayment
    repaymentOption: null,
    lastRepaidAt: null,

    // Timestamps
    createdAt: now,
    updatedAt: now
  };
}

// ==========================
// READ USER
// ==========================
async function getUserByPhone(phone) {
  if (!phone) return null;

  try {
    const ref = db.collection(USERS_COLLECTION).doc(phone);
    const snap = await ref.get();

    if (!snap.exists) return null;

    return { phone: snap.id, ...snap.data() };
  } catch (e) {
    console.error("getUserByPhone error:", e);
    return null;
  }
}

// ==========================
// CREATE USER (SAFE)
// ==========================
async function createUser(phone, extraData = {}) {
  if (!phone) return null;

  const ref = db.collection(USERS_COLLECTION).doc(phone);

  const payload = {
    ...defaultUser(phone),
    ...extraData,
    updatedAt: new Date()
  };

  await ref.set(payload, { merge: true });

  return payload;
}

// ==========================
// UPDATE USER
// ==========================
async function updateUser(phone, data = {}) {
  if (!phone) return;

  await db.collection(USERS_COLLECTION)
    .doc(phone)
    .set(
      {
        ...data,
        updatedAt: new Date()
      },
      { merge: true }
    );
}

module.exports = {
  getUserByPhone,
  createUser,
  updateUser
};
