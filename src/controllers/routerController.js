const { getUserByPhone, createUser, updateUser } = require("../services/userService");

/**
 * Main WhatsApp message router
 */
async function routeMessage(from, message) {
  try {
    if (!from || !message) {
      return "Invalid message received. Please try again.";
    }

    const text = message.trim().toLowerCase();
    let user = await getUserByPhone(from);

    // =========================
    // NEW USER
    // =========================
    if (!user) {
      await createUser({
        phone: from,
        stage: "onboarding",
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return "Welcome to Paylite 👋\nReply YES to begin.";
    }

    // =========================
    // START ONBOARDING
    // =========================
    if (user.stage === "onboarding" && text === "yes") {
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
        await updateUser(from, {
          termsAccepted: true,
          termsAcceptedAt: new Date(),
          termsVersion: "v1.0",
          updatedAt: new Date()
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
          voucherTotalRepayment: 165,
          updatedAt: new Date()
        });
      } else if (text === "2") {
        await updateUser(from, {
          voucherAmount: 200,
          voucherFee: 65,
          voucherTotalRepayment: 265,
          updatedAt: new Date()
        });
      } else {
        return "Please choose:\n1️⃣ R100\n2️⃣ R200";
      }

      return (
        "Choose a repayment option:\n" +
        "1️⃣ Pay in 30 days\n" +
        "2️⃣ Pay weekly (4 instalments)"
      );
    }

    // =========================
    // REPAYMENT OPTION
    // =========================
    if (!user.repaymentOption) {
      if (text === "1") {
        await updateUser(from, {
          repaymentOption: "single_30_days",
          updatedAt: new Date()
        });
      } else if (text === "2") {
        await updateUser(from, {
          repaymentOption: "weekly_4",
          updatedAt: new Date()
        });
      } else {
        return "Please select:\n1️⃣ 30 days\n2️⃣ Weekly";
      }

      return (
        "Please enter your electricity meter number.\n" +
        "Meter numbers are 7–13 digits."
      );
    }

    // =========================
    // METER NUMBER CAPTURE
    // =========================
    if (!user.meterNumber) {
      if (!/^\d{7,13}$/.test(text)) {
        return "❌ Invalid meter number.\nMeter numbers must be 7–13 digits.";
      }

      let supplier = "municipal";
      if (text.length === 11) supplier = "eskom_city_power";
      if (text.length === 13) supplier = "legacy";

      await updateUser(from, {
        meterNumber: text,
        meterSupplier: supplier,
        updatedAt: new Date()
      });

      return (
        "Meter number saved ✅\n" +
        "Reply REQUEST to submit your voucher for approval."
      );
    }

    // =========================
    // SUBMIT VOUCHER REQUEST (BLOCK WITHOUT METER)
    // =========================
    if (text === "request") {
      if (!user.meterNumber || !user.meterSupplier) {
        return (
          "⚠️ Meter details missing.\n\n" +
          "Please enter your electricity meter number first.\n" +
          "Meter numbers are 7–13 digits."
        );
      }

      if (user.voucherStatus === "pending") {
        return "Your voucher request is already under review ⏳";
      }

      await updateUser(from, {
        voucherStatus: "pending",
        voucherRequestedAt: new Date(),
        updatedAt: new Date()
      });

      return (
        "Your voucher request has been submitted ✅\n" +
        "You will be notified once reviewed."
      );
    }

    // =========================
    // ACTIVE / DEFAULT
    // =========================
    return (
      "How can I help you today?\n" +
      "Reply REQUEST to request a voucher."
    );

  } catch (error) {
    console.error("routeMessage error:", error);
    return "A system error occurred. Please try again later.";
  }
}

module.exports = { routeMessage };
