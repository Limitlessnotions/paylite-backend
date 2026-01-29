const { db } = require("../services/firebase");

async function requestVoucherAmount(from, message) {
  const amount = parseInt(message);

  if (isNaN(amount) || amount < 20 || amount > 2000) {
    return "Please enter an amount between R20 and R2000.";
  }

  const userRef = db.collection("users").doc(from);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    return "Please complete onboarding first.";
  }

  await userRef.update({
    pendingVoucher: {
      amount,
      stage: "awaiting_confirmation"
    }
  });

  const earlyFee = Math.round(amount * 0.05);
  const extendedFee = Math.round(amount * 0.12);

  return (
    `You requested R${amount} electricity.\n\n` +
    `1️⃣ Repay in 24 hrs – Fee R${earlyFee}\n` +
    `2️⃣ Repay in 7 days – Fee R${extendedFee}\n\n` +
    "Reply 1 or 2 to continue."
  );
}

async function confirmRepaymentOption(from, message) {
  const option = parseInt(message);

  if (![1, 2].includes(option)) {
    return "Reply 1 or 2 to select a repayment option.";
  }

  const userRef = db.collection("users").doc(from);
  const snap = await userRef.get();
  const user = snap.data();

  const voucherAmount = user.pendingVoucher.amount;

  await userRef.update({
    blocked: true,
    balance: voucherAmount,
    repaymentOption: option === 1 ? "single_30_days" : "weekly_7_days",
    voucherStatus: "pending",
    pendingVoucher: null
  });

  return (
    "✅ Voucher request submitted.\n\n" +
    "You will be notified once approved."
  );
}

module.exports = {
  requestVoucherAmount,
  confirmRepaymentOption
};
