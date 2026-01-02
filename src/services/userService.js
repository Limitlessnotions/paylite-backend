// src/services/userService.js
const { db } = require("./firebase");

async function getUserByPhone(phone) {
    const ref = db.collection("users").doc(phone);
    const snap = await ref.get();
    return snap.exists ? { id: snap.id, ...snap.data() } : null;
}

async function listUsers(limit = 100) {
    const snap = await db.collection("users")
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();

    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function setUserBlocked(phone, blocked) {
    await db.collection("users").doc(phone).set(
        { blocked, updatedAt: new Date() },
        { merge: true }
    );
}

async function updateUserBalance(phone, balance) {
    await db.collection("users").doc(phone).set(
        { balance, updatedAt: new Date() },
        { merge: true }
    );
}

async function ensureUserCreated(phone) {
    const ref = db.collection("users").doc(phone);
    const snap = await ref.get();
    if (!snap.exists) {
        await ref.set({
            createdAt: new Date(),
            updatedAt: new Date(),
            onboarded: false,
            balance: 0,
            blocked: false
        });
    }
}

module.exports = {
    getUserByPhone,
    listUsers,
    setUserBlocked,
    updateUserBalance,
    ensureUserCreated
};
