const { db } = require("./firebase");

async function createRepaymentSchedule(phone, amount, option) {
  const now = new Date();
  let dueDate;

  if (option === "single_30_days") {
    dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  } else {
    // weekly 4 installments (basic version)
    dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  await db.collection("repayments").add({
    phone,
    amount,
    option,
    status: "pending",
    dueDate,
    createdAt: now
  });

  await db.collection("users").doc(phone).set({
    repaymentStatus: "pending",
    repaymentDueDate: dueDate
  }, { merge: true });
}

async function markRepaymentPaid(phone) {
  // mark latest repayment as paid
  const snap = await db.collection("repayments")
    .where("phone", "==", phone)
    .where("status", "==", "pending")
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();

  if (!snap.empty) {
    await snap.docs[0].ref.update({
      status: "paid",
      paidAt: new Date()
    });
  }

  await db.collection("users").doc(phone).set({
    repaymentStatus: "paid",
    balance: 0,
    blocked: false,
    hasActiveVoucher: false
  }, { merge: true });
}

module.exports = {
  createRepaymentSchedule,
  markRepaymentPaid
};
