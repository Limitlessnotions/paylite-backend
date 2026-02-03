const { db } = require("../services/firebase");
const { generateLoanAgreement } = require("../services/loanAgreementService");

/**
 * STEP 1: User enters voucher amount
 */
async function requestVoucherAmount(from, message) {
  const amount = parseInt(message);

  if (isNaN(amount) || amount < 20 || amount > 2000) {
    return "Please enter an amount between R20 and R2000.";
  }

  const userRef = db.collection("users").doc(from);
  const snap = await userRef.get();

  if (!snap.exists) {
    return "Please complete onboarding first.";
  }

  const user = snap.data();

  // Enforce screening approval
  if (user.screeningStatus !== "approved" || !user.creditApproved) {
    return "Your account is not approved for credit at this time.";
  }

  await userRef.update({
    pendingVoucher: {
      amount,
      stage: "awaiting_repayment_option"
    },
    updatedAt: new Date()
  });

  const earlyFee = Math.round(amount * 0.05);
  const extendedFee = Math.round(amount * 0.12);

  return (
    `You requested electricity worth R${amount}.\n\n` +
    `1️⃣ Repay in 24 hours – Fee R${earlyFee}\n` +
    `2️⃣ Repay in 7 days – Fee R${extendedFee}\n\n` +
    "Reply 1 or 2 to continue."
  );
}

/**
 * STEP 2: User selects repayment option
 * → SEND T&Cs LINK (DO NOT LOCK USER YET)
 */
async function confirmRepaymentOption(from, message) {
  const option = parseInt(message);

  if (![1, 2].includes(option)) {
    return "Reply 1 or 2 to select a repayment option.";
  }

  const userRef = db.collection("users").doc(from);
  const snap = await userRef.get();

  if (!snap.exists) {
    return "Please type MENU to restart.";
  }

  const user = snap.data();

  if (!user.pendingVoucher) {
    return "No pending voucher request found. Reply MENU.";
  }

  await userRef.update({
    pendingVoucher: {
      ...user.pendingVoucher,
      repaymentOption: option === 1 ? "early_24_hours" : "extended_7_days",
      stage: "awaiting_terms_acceptance"
    },
    termsLinkSent: true,
    updatedAt: new Date()
  });

  return (
    "📄 Before we proceed, please review our Terms & Conditions:\n\n" +
    "🔗 https://paylite-backend.onrender.com/terms\n\n" +
    "Once you are done, return here and reply AGREE to continue."
  );
}

/**
 * STEP 3: User accepts T&Cs
 * → GENERATE AGREEMENT
 * → LOCK USER
 * → SUBMIT VOUCHER FOR APPROVAL
 */
async function acceptTermsAndFinalize(from) {
  const userRef = db.collection("users").doc(from);
  const snap = await userRef.get();

  if (!snap.exists) {
    return "Please type MENU to restart.";
  }

  const user = snap.data();

  if (
    !user.pendingVoucher ||
    user.pendingVoucher.stage !== "awaiting_terms_acceptance"
  ) {
    return "No active voucher process found. Reply MENU.";
  }

  const agreement = await generateLoanAgreement({
    phone: from,
    amount: user.pendingVoucher.amount,
    repaymentOption: user.pendingVoucher.repaymentOption
  });

  await userRef.update({
    termsAcceptedAtVoucher: true,
    agreementId: agreement.id,
    agreementUrl: agreement.url,
    voucherStatus: "pending",
    blocked: true,
    balance: user.pendingVoucher.amount,
    pendingVoucher: null,
    updatedAt: new Date()
  });

  return (
    "✅ Thank you. Your voucher request has been submitted.\n\n" +
    "📄 Your loan agreement is ready:\n" +
    `${agreement.url}\n\n` +
    "You will be notified once your voucher is approved."
  );
}

module.exports = {
  requestVoucherAmount,
  confirmRepaymentOption,
  acceptTermsAndFinalize
};
