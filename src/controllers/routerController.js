const { db } = require("../services/firebase");
const { handleOnboarding } = require("./onboardingController");
const {
  requestVoucherAmount,
  confirmRepaymentOption,
  acceptTerms
} = require("./voucherController");

async function routeMessage(from, message) {
  const text = message.trim().toLowerCase();
  const userRef = db.collection("users").doc(from);
  const snap = await userRef.get();

  // =========================
  // GLOBAL COMMANDS (ALWAYS)
  // =========================
  if (text === "help" || text === "support") {
    return (
      "Paylite Support 🧑‍💼\n\n" +
      "• Reply MENU to see options\n" +
      "• Reply AGENT for human support"
    );
  }

  if (text === "menu") {
    return (
      "Paylite Menu 📋\n\n" +
      "• BUY – Request electricity\n" +
      "• BALANCE – Check balance\n" +
      "• REPAYMENT – View repayment\n" +
      "• HELP – Support"
    );
  }

  // =========================
  // USER NOT ONBOARDED
  // =========================
  if (!snap.exists || snap.data().onboarded !== true) {
    return await handleOnboarding(from, message);
  }

  const user = snap.data();

  // =========================
  // SCREENING ENFORCEMENT (M3)
  // =========================
  if (user.screeningStatus === "pending") {
    return "Your account is currently under screening. Please wait for approval.";
  }

  if (user.screeningStatus === "rejected") {
    return "Unfortunately, your screening was not approved. You cannot use Paylite.";
  }

  if (!user.creditApproved) {
    return "Your account is not approved for credit at this time.";
  }

  // =========================
  // VOUCHER STATUS DELIVERY
  // =========================
  if (user.voucherStatus === "approved") {
    return (
      "⚡ Your electricity voucher has been approved!\n\n" +
      "Your token is being processed.\n\n" +
      "Reply MENU to continue."
    );
  }

  if (user.voucherStatus === "rejected") {
    return (
      "❌ Your voucher request was rejected.\n\n" +
      "Reply MENU to try again or contact support."
    );
  }

  // =========================
  // BLOCKED (ACTIVE LOAN)
  // =========================
  if (user.blocked) {
    return "You have an unpaid balance. Please repay before continuing.";
  }

  // =========================
  // ACCEPT TERMS (M4)
  // =========================
  if (text === "agree") {
    return await acceptTerms(from);
  }

  // =========================
  // BUY FLOW
  // =========================
  if (text === "buy" || text === "request") {
    return "Enter the amount of electricity you want (R20 – R2000):";
  }

  // Pending repayment option
  if (user.pendingVoucher?.stage === "awaiting_repayment_option") {
    return await confirmRepaymentOption(from, message);
  }

  // Amount entry
  if (/^\d+$/.test(text)) {
    return await requestVoucherAmount(from, message);
  }

  return "Reply MENU to continue.";
}

module.exports = { routeMessage };
