const {
  getUserByPhone,
  createUser,
  updateUser
} = require("../services/userService");

async function routeMessage(from, message) {
  try {
    const phone = String(from || "").trim();
    const text = String(message || "").trim().toLowerCase();

    if (!phone) {
      console.error("routeMessage blocked: empty phone");
      return "Invalid message source.";
    }

    if (!text) {
      return "Please send a valid message.";
    }

    let user = await getUserByPhone(phone);

    // =========================
    // NEW USER
    // =========================
    if (!user) {
      await createUser({
        phone,
        stage: "onboarding",
        termsAccepted: false
      });

      return "Welcome to Paylite 👋\nReply YES to begin.";
    }

    // =========================
    // START FLOW
    // =========================
    if (text === "yes" && !user.termsAccepted) {
      return (
        "Before we continue, please review and accept our Terms & Conditions.\n" +
        "Reply ACCEPT to proceed."
      );
    }

    // =========================
    // TERMS ACCEPTANCE
    // =========================
    if (!user.termsAccepted) {
      if (text === "accept") {
        await updateUser(phone, {
          termsAccepted: true,
          termsAcceptedAt: new Date(),
          termsVersion: "v1.0"
        });

        return (
          "Thank you ✅\n\n" +
          "Please choose your voucher amount:\n" +
          "1️⃣ R100\n" +
          "2️⃣ R200"
        );
      }

      return "Please reply ACCEPT to continue.";
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
        return "Select:\n1️⃣ 30 days\n2️⃣ Weekly";
      }

      return "Reply REQUEST to submit your voucher for approval.";
    }

    // =========================
    // SUBMIT REQUEST
    // =========================
    if (text === "request") {
      if (user.voucherStatus === "pending") {
        return "Your voucher is already under review ⏳";
      }

      await updateUser(phone, {
        voucherStatus: "pending",
        voucherRequestedAt: new Date(),
        hasActiveVoucher: false
      });

      return (
        "Your voucher request has been submitted ✅\n" +
        "You will be notified once reviewed."
      );
    }

    // =========================
    // ACTIVE VOUCHER
    // =========================
    if (user.voucherStatus === "approved" && user.hasActiveVoucher) {
      if (text === "paid") {
        await updateUser(phone, {
          hasActiveVoucher: false,
          voucherStatus: "none",
          voucherAmount: null,
          voucherFee: null,
          voucherTotalRepayment: null,
          repaymentOption: null
        });

        return "Payment confirmed ✅\nYou may request another voucher.";
      }

      return (
        `Outstanding balance: R${user.voucherTotalRepayment}\n` +
        "Reply PAID once payment is completed."
      );
    }

    return "Please follow the prompts to continue.";

  } catch (err) {
    console.error("routeMessage fatal error:", err);
    return "A system error occurred. Please try again later.";
  }
}

module.exports = { routeMessage };
