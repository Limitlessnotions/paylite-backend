const { db } = require("../services/firebase");
const { handleOnboarding } = require("./OnboardingController");
const {
  requestVoucherAmount,
  confirmRepaymentOption
} = require("./VoucherController");

async function routeMessage(from, message) {
  const text = message.trim().toLowerCase();

  const userRef = db.collection("users").doc(from);
  const snap = await userRef.get();
  const user = snap.exists ? snap.data() : null;

  // 1️⃣ GLOBAL COMMANDS — ALWAYS FIRST
  if (text === "menu" || text === "help" || text === "support") {
    return await handleOnboarding(from, message);
  }

  // 2️⃣ USER NOT ONBOARDED → FORCE ONBOARDING
  if (!user || user.onboarded !== true) {
    return await handleOnboarding(from, message);
  }

  // 3️⃣ USER CONFIRMING REPAYMENT OPTION
  if (user.pendingVoucher?.stage === "awaiting_confirmation") {
    return await confirmRepaymentOption(from, message);
  }

  // 4️⃣ USER ENTERING AMOUNT (NUMBERS)
  if (!isNaN(parseInt(message))) {
    return await requestVoucherAmount(from, message);
  }

  // 5️⃣ FALLBACK
  return "How can I help you today?\nReply REQUEST to request a voucher.";
}

module.exports = { routeMessage };
