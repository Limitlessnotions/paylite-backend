const { getUserByPhone, createUser, updateUser } = require("../services/userService");
const { logAudit } = require("../services/auditService");

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
        termsAccepted: false,
        createdAt: new Date()
      });

      return "Welcome to Paylite 👋\nReply YES to begin.";
    }

    // =========================
    // TERMS ACCEPTANCE
    // =========================
    if (!user.termsAccepted) {
      if (text === "accept") {
        await updateUser(from, {
          termsAccepted: true,
          termsAcceptedAt: new Date(),
          termsVersion: "v1.0"
        });

        return "Thank you ✅\nPlease enter your electricity meter number (7–13 digits).";
      }

      return "Please reply ACCEPT to continue.";
    }

    // =========================
    // METER NUMBER CAPTURE
    // =========================
    if (!user.meterValidated) {
      const meter = message.trim();

      // Numeric only
      if (!/^\d+$/.test(meter)) {
        return "❌ Invalid meter number.\nMeter numbers must be digits only.";
      }

      // Length check
      if (meter.length < 7 || meter.length > 13) {
        return "❌ Invalid meter number.\nMeter numbers must be between 7 and 13 digits.";
      }

      // Supplier mapping
      let supplier = "municipal";
      if (meter.length === 11) supplier = "eskom_or_city_power";
      if (meter.length === 13) supplier = "legacy";

      await updateUser(from, {
        meterNumber: meter,
        meterSupplier: supplier,
        meterValidated: true,
        meterValidatedAt: new Date()
      });

      await logAudit({
        action: "meter_validation",
        phone: from,
        meterNumber: meter,
        supplier,
        result: "valid",
        timestamp: new Date()
      });

      return (
        "✅ Meter number verified.\n\n" +
        "Please choose your voucher amount:\n" +
        "1️⃣ R100\n" +
        "2️⃣ R200"
      );
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
        return "Please choose a valid option:\n1️⃣ R100\n2️⃣ R200";
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
    // SUBMIT REQUEST
    // =========================
    if (text === "request") {
      await updateUser(from, {
        voucherStatus: "pending",
        voucherRequestedAt: new Date()
      });

      return "✅ Your request has been submitted for approval.";
    }

    return "Please follow the prompts to continue.";

  } catch (err) {
    console.error("routeMessage error:", err);
    return "A system error occurred. Please try again later.";
  }
}

module.exports = { routeMessage };
