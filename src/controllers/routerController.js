const { handleOnboarding } = require("./onboardingController");
const {
  requestVoucherAmount,
  confirmRepaymentOption
} = require("./voucherController");

const { db } = require("../services/firebase");

async function routeMessage(from, message) {
  const text = message.trim().toLowerCase();

  const userRef = db.collection("users").doc(from);
  const snap = await userRef.get();

  // --------------------
  // GLOBAL COMMANDS (NO USER REQUIRED)
  // --------------------
  if (text === "help" || text === "support") {
    return (
      "Paylite Support 🧑‍💼\n\n" +
      "• Reply MENU to see options\n" +
      "• Reply AGENT for human support"
    );
  }

  // --------------------
  // USER DOES NOT EXIST OR NOT ONBOARDED
  // --------------------
  if (!snap.exists || snap.data().onboarded !== true) {
    return await handleOnboarding(from, message);
  }

  const user = snap.data();

  // --------------------
  // MENU (ONLY AFTER ONBOARDING)
  // --------------------
  if (text === "menu") {
    return (
      "Paylite Menu 📋\n\n" +
      "• BUY – Request electricity\n" +
      "• BALANCE – Check balance\n" +
      "• REPAYMENT – View repayment\n" +
      "• HELP – Support"
    );
  }

  // =============================
  // COMPLIANCE GATE (POPIA + T&C)
  // =============================
  if (!user.popiaConsent || !user.termsAccepted) {
    return "You must complete onboarding and accept our Terms & Conditions to continue.";
  }

  // =============================
  // VOUCHER APPROVAL DELIVERY
  // =============================
  if (user.voucherStatus === "approved") {
    return (
      "⚡ Your electricity voucher request has been approved!\n\n" +
      "Your voucher token is being processed.\n\n" +
      "Reply MENU to continue."
    );
  }

  if (user.voucherStatus === "rejected") {
    return (
      "❌ Your electricity voucher request was not approved.\n\n" +
      "Reply MENU to try again or contact support."
    );
  }

  // --------------------
  // BLOCKED USER (DEBT)
  // --------------------
  if (user.blocked) {
    return "You currently have an unpaid balance. Please repay to continue.";
  }

  // --------------------
  // BUY FLOW
  // --------------------
  if (text === "buy" || text === "request") {
    return "Enter the amount of electricity you want (R20 – R2000):";
  }

  if (user.pendingVoucher?.stage === "awaiting_confirmation") {
    return await confirmRepaymentOption(from, message);
  }

  if (/^\d+$/.test(text)) {
    return await requestVoucherAmount(from, message);
  }

  return "Reply MENU to continue.";
}

module.exports = { routeMessage };
