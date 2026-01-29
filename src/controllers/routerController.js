const { db } = require("../services/firebase");
const { handleOnboarding } = require("./onboardingController");
const {
  requestVoucherAmount,
  confirmRepaymentOption
} = require("./voucherController");

async function routeMessage(from, message) {
  const text = message.trim().toLowerCase();

  const userRef = db.collection("users").doc(from);
  const snap = await userRef.get();
  const user = snap.exists ? snap.data() : null;

  // 1️⃣ GLOBAL COMMANDS FIRST
  if (text === "menu" || text === "help" || text === "support") {
    return await handleOnboarding(from, message);
  }

  // 2️⃣ FORCE ONBOARDING IF NOT DONE
  if (!user || user.onboarded !== true) {
    return await handleOnboarding(from, message);
  }

  // 3️⃣ REPAYMENT CONFIRMATION
  if (user.pendingVoucher?.stage === "awaiting_confirmation") {
    return await confirmRepaymentOption(from, message);
  }

  // 4️⃣ AMOUNT ENTRY
  if (!isNaN(parseInt(message))) {
    return await requestVoucherAmount(from, message);
  }

  // 5️⃣ FALLBACK
  return "How can I help you today?\nReply REQUEST to request a voucher.";
}

module.exports = { routeMessage };
