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
        createdAt: new Date(),
        updatedAt: new Date()
      });
      snap = await userRef.get();
    }

    const user = snap.data();

    // Normalize onboarded flag (CRITICAL FIX)
    const isOnboarded =
      user.onboarded === true || user.onboarded === "true";

    // 🔹 GLOBAL COMMANDS (always work)
    if (text === "help" || text === "support") {
      return (
        "Paylite Support 🧑‍💼\n\n" +
        "• Reply MENU to see options\n" +
        "• Reply AGENT for human support\n" +
        "• Reply REPAYMENT for payment help"
      );
    }

    // 🔹 MENU (only if onboarded)
    if (text === "menu" && isOnboarded) {
      return (
        "Paylite Menu 📋\n\n" +
        "• BUY – Request electricity\n" +
        "• BALANCE – Check balance\n" +
        "• REPAYMENT – View repayment\n" +
        "• HELP – Support"
      );
    }

    // 🔹 BLOCK MENU IF NOT ONBOARDED
    if (text === "menu" && !isOnboarded) {
      return "Please complete onboarding to continue.";
    }

    // 🔹 ONBOARDING FLOW
    const step = user.onboardStep || 0;

    if (step === 0) {
      await userRef.update({ onboardStep: 1, updatedAt: new Date() });
      return "Welcome to Paylite! What is your full name?";
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
      return "Enter your electricity meter number:";
    }

    if (step === 4) {
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
        onboarded: true, // BOOLEAN
        onboardStep: 99,
        updatedAt: new Date()
      });

      return "Onboarding complete 🎉\nReply MENU to continue.";
    }

    // 🔹 FALLBACK
    return "How can I help you today?\nReply REQUEST to request a voucher.";
  }
};const { db } = require("../services/firebase");

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
        createdAt: new Date(),
        updatedAt: new Date()
      });
      snap = await userRef.get();
    }

    const user = snap.data();

    // Normalize onboarded flag (CRITICAL FIX)
    const isOnboarded =
      user.onboarded === true || user.onboarded === "true";

    // 🔹 GLOBAL COMMANDS (always work)
    if (text === "help" || text === "support") {
      return (
        "Paylite Support 🧑‍💼\n\n" +
        "• Reply MENU to see options\n" +
        "• Reply AGENT for human support\n" +
        "• Reply REPAYMENT for payment help"
      );
    }

    // 🔹 MENU (only if onboarded)
    if (text === "menu" && isOnboarded) {
      return (
        "Paylite Menu 📋\n\n" +
        "• BUY – Request electricity\n" +
        "• BALANCE – Check balance\n" +
        "• REPAYMENT – View repayment\n" +
        "• HELP – Support"
      );
    }

    // 🔹 BLOCK MENU IF NOT ONBOARDED
    if (text === "menu" && !isOnboarded) {
      return "Please complete onboarding to continue.";
    }

    // 🔹 ONBOARDING FLOW
    const step = user.onboardStep || 0;

    if (step === 0) {
      await userRef.update({ onboardStep: 1, updatedAt: new Date() });
      return "Welcome to Paylite! What is your full name?";
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
      return "Enter your electricity meter number:";
    }

    if (step === 4) {
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
        onboarded: true, // BOOLEAN
        onboardStep: 99,
        updatedAt: new Date()
      });

      return "Onboarding complete 🎉\nReply MENU to continue.";
    }

    // 🔹 FALLBACK
    return "How can I help you today?\nReply REQUEST to request a voucher.";
  }
};
