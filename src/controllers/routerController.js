const { handleOnboarding } = require("./onboardingController");
const {
  requestVoucherAmount,
  confirmRepaymentOption,
  acceptTerms
} = require("./voucherController");

const { db } = require("../services/firebase");

async function routeMessage(from, message) {
  const text = message.trim().toLowerCase();
  const userRef = db.collection("users").doc(from);
  const snap = await userRef.get();

  // =============================
  // GLOBAL COMMANDS
  // =============================
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

  // =============================
  // USER NOT ONBOARDED
  // =============================
  if (!snap.exists || snap.data().onboarded !== true) {
    return await handleOnboarding(from, message);
  }

  const user = snap.data();

  // =============================
  // 📄 LOAN AGREEMENT DELIVERY
  // =============================
  if (user.loanAgreement?.file) {
    return (
      "📄 Your Paylite Loan Agreement is ready.\n\n" +
      "Download your copy here:\n" +
      `https://paylite-backend.onrender.com/agreements/${user.loanAgreement.file}\n\n` +
      "Keep this document for your records."
    );
  }

  // =============================
  // SCREENING ENFORCEMENT (M3)
  // =============================
  if (user.screeningStatus === "pending") {
    return "Your account is under screening. Please wait for approval.";
  }

  if (user.screeningStatus === "rejected") {
    return "Your screening was not approved. You cannot use Paylite.";
  }

  if (!user.creditApproved) {
    return "Your account is not approved for credit at this time.";
  }

  // =============================
  // TERMS ACCEPTANCE FLOW (M4)
  // =============================
  if (text === "agree") {
    return await acceptTerms(from);
  }

  // =============================
  // VOUCHER STATUS DELIVERY
  // =============================
  if (user.voucherStatus === "approved") {
    return (
      "⚡ Your electricity voucher has been approved.\n\n" +
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

  // =============================
  // BLOCKED (UNPAID)
  // =============================
  if (user.blocked) {
    return "You have an unpaid balance. Please repay before continuing.";
  }

  // =============================
  // BUY FLOW
  // =============================
  if (text === "buy" || text === "request") {
    return "Enter the amount you want (R20 – R2000):";
  }

  if (user.pendingVoucher?.stage === "awaiting_repayment_option") {
    return await confirmRepaymentOption(from, message);
  }

  if (/^\d+$/.test(text)) {
    return await requestVoucherAmount(from, message);
  }

  return "Reply MENU to continue.";
}

module.exports = { routeMessage };
