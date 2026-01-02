const { db } = require("./firebase");

async function addRepayment({ userPhone, voucherId, amount, status }) {
    const ref = db.collection("repayments").doc();
    const repayment = {
        id: ref.id,
        userPhone,
        voucherId,
        amount,
        status,
        createdAt: new Date()
    };
    await ref.set(repayment);
    return repayment;
}

async function listRepayments(limit = 100) {
    const snap = await db.collection("repayments")
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();

    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function listRepaymentsByUser(phone, limit = 50) {
    const snap = await db.collection("repayments")
        .where("userPhone", "==", phone)
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();

    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

module.exports = {
    addRepayment,
    listRepayments,
    listRepaymentsByUser
};
