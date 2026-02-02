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

  // =====================
  // GLOBAL COMMANDS
  // =====================
  if (text === "help" || text === "support") {
    return (
      "Paylite Support 🧑‍💼\n\n" +
      "• MENU – Options\n" +
      "• AGENT – Human support"
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

  // =====================
  // ONBOARDING
  // =====================
  if (!snap.exists || snap.data().onboarded !== true) {
    return await handleOnboarding(from, message);
  }

  const user = snap.data();

  // =====================
  // SCREENING ENFORCEMENT (M3)
  // =====================
  if (user.screeningStatus === "pending") {
    return "Your account is under review. You’ll be notified once approved.";
  }

  if (user.screeningStatus === "rejected") {
    return "Your screening was not approved. You cannot use Paylite.";
  }

  if (!user.creditApproved) {
    return "Your account is not approved for credit yet.";
  }

  // =====================
  // CONSENT GATE (ONLY FOR BUY)
  // =====================
  if ((text === "buy" || text === "request") &&
      (!user.termsAccepted || !user.popiaConsent)) {

    await userRef.set({
      awaitingConsent: true,
      updatedAt: new Date()
    }, { merge: true });

    return (
      "⚠️ Before requesting electricity, please review and accept our terms:\n\n" +
      "🔗 Terms & Conditions:\nhttps://paylite.co.za/terms\n\n" +
      "🔗 Privacy Policy:\nhttps://paylite.co.za/privacy\n\n" +
      "After reviewing, return here and reply YES to continue."
    );
  }

  // =====================
  // CONSENT CONFIRMATION
  // =====================
  if (text === "yes" && user.awaitingConsent === true) {
    await userRef.set({
      termsAccepted: true,
      popiaConsent: true,
      awaitingConsent: false,
      consentedAt: new Date(),
      updatedAt: new Date()
    }, { merge: true });

    // TODO: send agreement PDF (WhatsApp / Email)
    return (
      "✅ Consent recorded.\n\n" +
      "Your loan agreement has been sent to you.\n\n" +
      "Reply BUY to continue."
    );
  }

  // =====================
  // BLOCKED (UNPAID)
  // =====================
  if (user.blocked) {
    return "You have an unpaid balance. Please repay to continue.";
  }

  // =====================
  // BUY FLOW
  // =====================
  if (text === "buy" || text === "request") {
    return "Enter the amount you want (R20 – R2000):";
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
