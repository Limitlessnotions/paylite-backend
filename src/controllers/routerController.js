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
  // GLOBAL COMMANDS
  // --------------------
  if (text === "help" || text === "support") {
    return (
      "Paylite Support 🧑‍💼\n\n" +
      "• Reply MENU to see options\n" +
      "• Reply AGENT for human support"
    );
  }

  // --------------------
  // USER NOT ONBOARDED
  // --------------------
  if (!snap.exists || snap.data().onboarded !== true) {
    return await handleOnboarding(from, message);
  }

  const user = snap.data();

  // --------------------
  // MENU
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

  // --------------------
  // COMPLIANCE CHECK
  // --------------------
  if (!user.popiaConsent || !user.termsAccepted) {
    return "You must accept our Terms & Conditions to continue.";
  }

  // --------------------
  // CREDIT SCREENING ENFORCEMENT (M3 CORE)
  // --------------------
  if (user.creditApproved !== true) {
    return (
      "⛔ Your account is pending credit screening.\n\n" +
      "We will notify you once your application is reviewed."
    );
  }

  // --------------------
  // ADMIN DECISION FEEDBACK
  // --------------------
  if (user.screeningStatus === "rejected") {
    return (
      "❌ Your credit application was not approved.\n\n" +
      "Reply HELP for support."
    );
  }

  // --------------------
  // BLOCKED DUE TO DEBT
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
