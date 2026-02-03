const { db } = require("../services/firebase");
const { generateLoanAgreement } = require("../services/loanAgreementService");

/**
 * STEP 1 — User enters voucher amount
 */
async function requestVoucherAmount(from, message) {
  const amount = parseInt(message);

  if (isNaN(amount) || amount < 20 || amount > 2000) {
    return "Please enter a valid amount between R20 and R2000.";
  }

  const userRef = db.collection("users").doc(from);
  const snap = await userRef.get();

  if (!snap.exists) {
    return "Please complete onboarding first.";
  }

  const user = snap.data();

  // Enforce screening approval
  if (!user.creditApproved) {
    return "Your account is not approved for credit at this time.";
  }

  // Save pending voucher
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
    `⚡ Electricity Voucher Request\n\n` +
    `Amount: R${amount}\n\n` +
    `Choose repayment option:\n` +
    `1️⃣ 24 hours – Fee R${earlyFee}\n` +
    `2️⃣ 7 days – Fee R${extendedFee}\n\n` +
    `Reply 1 or 2 to continue.`
  );
}

/**
 * STEP 2 — User selects repayment option
 * This is where T&Cs are enforced
 */
async function confirmRepaymentOption(from, message) {
  const option = parseInt(message);

  if (![1, 2].includes(option)) {
    return "Invalid option. Reply 1 or 2 to continue.";
  }

  const userRef = db.collection("users").doc(from);
  const snap = await userRef.get();

  if (!snap.exists) {
    return "Session expired. Reply MENU to restart.";
  }

  const user = snap.data();
  const pending = user.pendingVoucher;

  if (!pending || pending.stage !== "awaiting_repayment_option") {
    return "No active voucher request found. Reply MENU.";
  }

  // Enforce T&Cs acceptance at POINT OF CREDIT
  if (!user.termsAccepted) {
    await userRef.update({
      pendingVoucher: {
        ...pending,
        repaymentOption: option,
        stage: "awaiting_terms"
      }
    });

    return (
      "📄 Before proceeding, you must review and accept our Terms & Conditions.\n\n" +
      "👉 https://paylite-backend.onrender.com/terms\n\n" +
      "After reviewing, reply AGREE to continue."
    );
  }

  return await finalizeVoucher(from, option);
}

/**
 * STEP 3 — User agrees to T&Cs
 */
async function acceptTerms(from) {
  const userRef = db.collection("users").doc(from);
  const snap = await userRef.get();

  if (!snap.exists) {
    return "Session expired. Reply MENU.";
  }

  const user = snap.data();
  const pending = user.pendingVoucher;

  if (!pending || pending.stage !== "awaiting_terms") {
    return "No pending agreement found. Reply MENU.";
  }

  await userRef.update({
    termsAccepted: true,
    termsAcceptedAt: new Date()
  });

  return await finalizeVoucher(from, pending.repaymentOption);
}

/**
 * FINAL STEP — Create loan agreement & submit for admin approval
 */
async function finalizeVoucher(from, repaymentOption) {
  const userRef = db.collection("users").doc(from);
  const snap = await userRef.get();
  const user = snap.data();

  const amount = user.pendingVoucher.amount;

  // Generate loan agreement (record only)
  const agreement = await generateLoanAgreement({
    phone: from,
    amount,
    repaymentOption
  });

  // Update user state
  await userRef.update({
    blocked: true,
    balance: amount,
    voucherStatus: "pending",
    activeAgreementId: agreement.id,
    pendingVoucher: null,
    updatedAt: new Date()
  });

  return (
    "✅ Voucher request submitted successfully.\n\n" +
    "📄 Loan Agreement:\n" +
    `${agreement.url}\n\n` +
    "Your request is pending admin approval. You will be notified shortly."
  );
}

module.exports = {
  requestVoucherAmount,
  confirmRepaymentOption,
  acceptTerms
};
