const {
  getUserByPhone,
  createUser,
  updateUser
} = require("../services/userService");

async function routeMessage(from, message) {
  try {
    if (!from || !message) {
      return "Invalid message received. Please try again.";
    }

    const text = message.trim().toLowerCase();
    let user = await getUserByPhone(from);

    // =========================
    // CREATE USER (FIRST CONTACT)
    // =========================
    if (!user) {
      user = await createUser(from);

      return (
        "Welcome to Paylite 👋\n\n" +
        "Reply YES to begin."
      );
    }

    // =========================
    // START FLOW
    // =========================
    if (text === "yes" && !user.termsAccepted) {
      return (
        "Before we continue, please review and accept our Terms & Conditions.\n\n" +
        "Reply ACCEPT to proceed."
      );
    }

    // =========================
    // TERMS ACCEPTANCE
    // =========================
    if (!user.termsAccepted) {
      if (text === "accept") {
        await updateUser(from, {
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

      return "Please reply ACCEPT to continue.";
    }

    // =========================
    // VOUCHER AMOUNT
    // =========================
    if (!user.voucherAmount) {
      if (text === "1") {
        await updateUser(from, {
          voucherAmount: 100,
          voucherFee: 65,
          voucherTotalRepayment: 165
        });
      } else if (text === "2") {
        await updateUser(from, {
          voucherAmount: 200,
          voucherFee: 65,
          voucherTotalRepayment: 265
        });
      } else {
        return "Please choose:\n1️⃣ R100\n2️⃣ R200";
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
        await updateUser(from, { repaymentOption: "single_30_days" });
      } else if (text === "2") {
        await updateUser(from, { repaymentOption: "weekly_4" });
      } else {
        return "Please select:\n1️⃣ 30 days\n2️⃣ Weekly";
      }

      return "Reply REQUEST to submit your voucher for approval.";
    }

    // =========================
    // SUBMIT FOR APPROVAL
    // =========================
    if (text === "request") {
      if (user.voucherStatus === "pending") {
        return "Your voucher request is already under review ⏳";
      }

      await updateUser(from, {
        voucherStatus: "pending",
        voucherRequestedAt: new Date(),
        stage: "active"
      });

      return (
        "Your voucher request has been submitted ✅\n" +
        "You will be notified once approved."
      );
    }

    // =========================
    // ACTIVE VOUCHER
    // =========================
    if (user.voucherStatus === "approved" && user.hasActiveVoucher) {
      if (text === "paid") {
        await updateUser(from, {
          hasActiveVoucher: false,
          voucherStatus: null,
          voucherAmount: null,
          voucherFee: null,
          voucherTotalRepayment: null,
          voucherRequestedAt: null,
          repaymentOption: null
        });

        return "Payment confirmed ✅\nYou can now request another voucher.";
      }

      return (
        `Outstanding balance: R${user.voucherTotalRepayment}\n` +
        "Reply PAID once payment is completed."
      );
    }

    return "Please follow the prompts to continue.";

  } catch (error) {
    console.error("routeMessage error:", error);
    return "A system error occurred. Please try again later.";
  }
}

module.exports = { routeMessage };
