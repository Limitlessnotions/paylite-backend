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
    // CREATE USER
    // =========================
    if (!user) {
      await createUser({ phone: from, stage: "new" });
      return "Welcome to Paylite 👋\nReply YES to begin.";
    }

    // =========================
    // BLOCKED USER
    // =========================
    if (user.isBlocked) {
      return "Your account is restricted. Please contact support.";
    }

    // =========================
    // START
    // =========================
    if (!user.termsAccepted) {
      if (text === "yes") {
        return "Please review our Terms & Conditions.\nReply ACCEPT to continue.";
      }

      if (text === "accept") {
        await updateUser(from, {
          termsAccepted: true,
          stage: "onboarding"
        });

        return "Choose voucher amount:\n1️⃣ R100\n2️⃣ R200";
      }

      return "Reply YES to begin.";
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
        return "Choose:\n1️⃣ R100\n2️⃣ R200";
      }

      return "Choose repayment option:\n1️⃣ 30 days\n2️⃣ Weekly";
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
        return "Select:\n1️⃣ 30 days\n2️⃣ Weekly";
      }

      return "Reply REQUEST to submit voucher.";
    }

    // =========================
    // SUBMIT REQUEST
    // =========================
    if (text === "request") {
      await updateUser(from, {
        voucherStatus: "pending",
        stage: "active"
      });

      return "Your request is under review ⏳";
    }

    // =========================
    // COLLECT METER NUMBER (FIXED)
    // =========================
    if (user.voucherStatus === "approved" && !user.meterNumber) {
      if (!/^\d{6,20}$/.test(text)) {
        return "Please enter a valid electricity meter number.";
      }

      await updateUser(from, {
        meterNumber: text,
        fulfillmentStatus: "pending"
      });

      return (
        "Meter number received ✅\n" +
        "Electricity will be processed shortly."
      );
    }

    return "Please follow the prompts.";

  } catch (error) {
    console.error("routeMessage error:", error);
    return "System error. Please try again later.";
  }
}

module.exports = { routeMessage };
