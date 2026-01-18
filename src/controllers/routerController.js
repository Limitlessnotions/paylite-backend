const { getUserByPhone, createUser, updateUser } = require("../services/userService");

// ==========================
// MAIN ROUTER
// ==========================
async function routeMessage(from, message) {
  try {
    // 🔒 HARD GUARDS (CRITICAL)
    if (!from || typeof from !== "string" || !from.trim()) {
      console.warn("routeMessage ignored: invalid sender", from);
      return "Invalid sender.";
    }

    if (!message || typeof message !== "string") {
      return "Invalid message.";
    }

    const phone = from.trim();
    const text = message.trim().toLowerCase();

    let user = await getUserByPhone(phone);

    // =========================
    // NEW USER
    // =========================
    if (!user) {
      await createUser({
        phone,
        stage: "new",
        createdAt: new Date()
      });

      return (
        "Welcome to Paylite 👋\n\n" +
        "Reply YES to begin."
      );
    }

    // =========================
    // TERMS ACCEPTANCE
    // =========================
    if (!user.termsAccepted) {
      if (text === "yes") {
        return (
          "Before we continue, please review and accept our Terms & Conditions.\n" +
          "Reply ACCEPT to proceed."
        );
      }

      if (text === "accept") {
        await updateUser(phone, {
          termsAccepted: true,
          termsAcceptedAt: new Date(),
          stage: "onboarding"
        });

        return (
          "Thank you ✅\n\n" +
          "Please choose your voucher amount:\n" +
          "1️⃣ R100\n" +
          "2️⃣ R200"
        );
      }

      return "Reply YES to begin or ACCEPT to continue.";
    }

    // =========================
    // VOUCHER AMOUNT
    // =========================
    if (!user.voucherAmount) {
      if (text === "1") {
        await updateUser(phone, {
          voucherAmount: 100,
          voucherFee: 65,
          voucherTotalRepayment: 165
        });
      } else if (text === "2") {
        await updateUser(phone, {
          voucherAmount: 200,
          voucherFee: 65,
          voucherTotalRepayment: 265
        });
      } else {
        return "Choose a valid option:\n1️⃣ R100\n2️⃣ R200";
      }

      return (
        "Choose a repayment option:\n" +
        "1️⃣ Pay in 30 days\n" +
        "2️⃣ Pay weekly (4 installments)"
      );
    }

    // =========================
    // REPAYMENT OPTION
    // =========================
    if (!user.repaymentOption) {
      if (text === "1") {
        await updateUser(phone, { repaymentOption: "single_30_days" });
      } else if (text === "2") {
        await updateUser(phone, { repaymentOption: "weekly_4" });
      } else {
        return "Select repayment:\n1️⃣ 30 days\n2️⃣ Weekly";
      }

      return "Reply REQUEST to submit your voucher for approval.";
    }

    // =========================
    // SUBMIT REQUEST
    // =========================
    if (text === "request") {
      if (user.voucherStatus === "pending") {
        return "Your request is already under review ⏳";
      }

      await updateUser(phone, {
        voucherStatus: "pending",
        voucherRequestedAt: new Date()
      });

      return (
        "Your voucher request has been submitted ✅\n" +
        "You will be notified once reviewed."
      );
    }

    // =========================
    // APPROVED → COLLECT METER
    // =========================
    if (user.voucherStatus === "approved" && !user.meterNumber) {
      if (!/^\d{6,20}$/.test(text)) {
        return "Please enter a valid electricity meter number.";
      }

      await updateUser(phone, {
        meterNumber: text,
        fulfillmentStatus: "pending"
      });

      return (
        "Thank you ✅\n" +
        "Your meter number has been received.\n" +
        "Electricity will be processed shortly."
      );
    }

    // =========================
    // ACTIVE VOUCHER
    // =========================
    if (user.voucherStatus === "approved") {
      return (
        `Outstanding balance: R${user.voucherTotalRepayment}\n` +
        "You will be notified once electricity is loaded."
      );
    }

    return "Please follow the prompts to continue.";

  } catch (error) {
    console.error("routeMessage error:", error);
    return "A system error occurred. Please try again later.";
  }
}

module.exports = { routeMessage };
