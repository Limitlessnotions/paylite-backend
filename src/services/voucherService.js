const { db } = require("./firebase");

async function createVoucherRequest(phone, amount, option = null, status = "pending") {
    const ref = db.collection("vouchers").doc();
    const voucher = {
        id: ref.id,
        userPhone: phone,
        amount,
        option,
        status,
        createdAt: new Date()
    };
    await ref.set(voucher);
    return voucher;
}

async function updateVoucherStatus(voucherId, fields) {
    await db.collection("vouchers").doc(voucherId).set(
        { ...fields, updatedAt: new Date() },
        { merge: true }
    );
}

async function listVouchers(limit = 100) {
    const snap = await db.collection("vouchers")
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();

    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function listVouchersByUser(phone, limit = 50) {
    const snap = await db.collection("vouchers")
        .where("userPhone", "==", phone)
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();

    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

module.exports = {
    createVoucherRequest,
    updateVoucherStatus,
    listVouchers,
    listVouchersByUser
};
