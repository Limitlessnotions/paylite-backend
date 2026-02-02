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

  // =========================
  // GLOBAL COMMANDS (ALWAYS WORK)
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
  // NOT ONBOARDED → ONBOARD
  // =========================
  if (!snap.exists || snap.data().onboarded !== true) {
    return await handleOnboarding(from, message);
  }

  const user = snap.data();

  // =========================
  // SCREENING ENFORCEMENT (M3 CORE)
  // =========================
  if (user.screeningStatus === "pending") {
    return (
      "Your account is currently under screening.\n\n" +
      "You will be notified once a decision has been made."
    );
  }

  if (user.screeningStatus === "rejected") {
    return (
      "Your screening was not approved.\n\n" +
      "Unfortunately, you cannot use Paylite at this time."
    );
  }

  if (!user.creditApproved) {
    return (
      "Your account is not approved for credit yet.\n\n" +
      "Please wait for confirmation."
    );
  }

  // =========================
  // VOUCHER STATUS DELIVERY
  // =========================
  if (user.voucherStatus === "approved") {
    return (
      "⚡ Your electricity voucher has been approved!\n\n" +
      "Your token is being prepared.\n\n" +
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
  // BLOCKED (UNPAID)
  // =========================
  if (user.blocked) {
    return (
      "You have an outstanding balance.\n\n" +
      "Please complete repayment before continuing."
    );
  }

  // =========================
  // CONSENT ENFORCEMENT (ONLY AT BUY)
  // =========================
  if (user.awaitingConsent) {
    if (text !== "yes") {
      return (
        "Before proceeding, please review and accept:\n\n" +
        "🔗 https://paylite.co.za/terms\n\n" +
        "Reply YES once completed."
      );
    }

    await userRef.update({
      popiaConsent: true,
      termsAccepted: true,
      awaitingConsent: false,
      updatedAt: new Date()
    });

    return (
      "Thank you.\n\n" +
      "Your agreement has been recorded.\n\n" +
      "Reply BUY to continue."
    );
  }

  // =========================
  // BUY FLOW
  // =========================
  if (text === "buy" || text === "request") {
    if (!user.termsAccepted || !user.popiaConsent) {
      await userRef.update({
        awaitingConsent: true,
        updatedAt: new Date()
      });

      return (
        "Before requesting electricity, please review our Terms & Privacy Policy:\n\n" +
        "🔗 https://paylite.co.za/terms\n\n" +
        "Reply YES once completed."
      );
    }

    return "Enter the amount you want (R20 – R2000):";
  }

  // =========================
  // REPAYMENT OPTION
  // =========================
  if (user.pendingVoucher?.stage === "awaiting_confirmation") {
    return await confirmRepaymentOption(from, message);
  }

  // =========================
  // AMOUNT ENTRY
  // =========================
  if (/^\d+$/.test(text)) {
    return await requestVoucherAmount(from, message);
  }

  return "Reply MENU to continue.";
}

module.exports = { routeMessage };
