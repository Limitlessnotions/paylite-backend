const { db } = require("../services/firebase");

module.exports = {
  handleOnboarding: async function (from, message) {
    const text = message.trim().toLowerCase();
    const userRef = db.collection("users").doc(from);
    let snap = await userRef.get();

    // Create user if not exists
    if (!snap.exists) {
      await userRef.set({
        onboardStep: 0,
        onboarded: false,
        balance: 0,
        blocked: false,
        voucherStatus: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      snap = await userRef.get();
    }

    const user = snap.data();

    /* =====================================================
       🔴 HARD GLOBAL COMMANDS (ALWAYS OVERRIDE EVERYTHING)
       ===================================================== */

    if (text === "menu") {
      return (
        "Paylite Menu 📋\n\n" +
        "• BUY – Request electricity\n" +
        "• BALANCE – Check balance\n" +
        "• REPAYMENT – View repayment\n" +
        "• HELP – Support"
      );
    }

    if (text === "help" || text === "support") {
      return (
        "Paylite Support 🧑‍💼\n\n" +
        "• Reply MENU to see options\n" +
        "• Reply AGENT for human support\n" +
        "• Reply REPAYMENT for payment help"
      );
    }

    /* =====================================================
       🔒 BLOCKED USER CHECK
       ===================================================== */

    if (user.blocked) {
      return "Your account is currently restricted. Please contact support.";
    }

    /* =====================================================
       🟡 ONBOARDING FLOW (STATE MACHINE)
       ===================================================== */

    const step = user.onboardStep ?? 0;

    if (!user.onboarded) {
      if (step === 0) {
        await userRef.update({ onboardStep: 1, updatedAt: new Date() });
        return "Welcome to Paylite! 👋\n\nWhat is your full name?";
      }

      if (step === 1) {
        await userRef.update({
          fullName: message,
          onboardStep: 2,
          updatedAt: new Date()
        });
        return "Please enter your South African ID number:";
      }

      if (step === 2) {
        await userRef.update({
          idNumber: message,
          onboardStep: 3,
          updatedAt: new Date()
        });
        return "What is your physical address?";
      }

      if (step === 3) {
        await userRef.update({
          address: message,
          onboardStep: 4,
          updatedAt: new Date()
        });
        return "Please enter your electricity meter number:";
      }

      if (step === 4) {
        // Meter validation
        if (!/^\d{7,13}$/.test(message)) {
          return "❌ Invalid meter number.\nMeter numbers must be 7–13 digits.";
        }

        await userRef.update({
          meterNumber: message,
          onboardStep: 5,
          updatedAt: new Date()
        });

        return (
          "Please review our Terms & Conditions:\n" +
          "https://paylite.co.za/terms\n\n" +
          "Reply YES to accept."
        );
      }

      if (step === 5) {
        if (text !== "yes") {
          return "You must reply YES to continue.";
        }

        await userRef.update({
          onboarded: true,
          onboardStep: 99,
          updatedAt: new Date()
        });

        return "✅ Onboarding complete!\n\nReply MENU to continue.";
      }
    }

    /* =====================================================
       🔵 POST-ONBOARDING COMMANDS
       ===================================================== */

    if (text === "buy") {
      if (user.voucherStatus === "pending") {
        return "⏳ Your voucher request is already under review.";
      }

      await userRef.update({
        voucherStatus: "initiated",
        updatedAt: new Date()
      });

      return (
        "Choose voucher amount:\n\n" +
        "1️⃣ R100\n" +
        "2️⃣ R200\n\n" +
        "Reply with 1 or 2."
      );
    }

    if (text === "balance") {
      return `Your current balance is R${user.balance || 0}.`;
    }

    if (text === "repayment") {
      return "Your repayment details will appear here shortly.";
    }

    /* =====================================================
       🔚 FALLBACK
       ===================================================== */

    return "Reply MENU to continue.";
  }
};
