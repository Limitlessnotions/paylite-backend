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
    const step = user.onboardStep || 0;

    // ===== GLOBAL COMMANDS =====
    if (text === "help" || text === "support") {
      return (
        "Paylite Support 🧑‍💼\n\n" +
        "• Reply MENU to see options\n" +
        "• Reply AGENT for human support\n" +
        "• Reply REPAYMENT for payment help"
      );
    }

    if (text === "menu" && user.onboarded) {
      return (
        "Paylite Menu 📋\n\n" +
        "• BUY – Request electricity\n" +
        "• BALANCE – Check balance\n" +
        "• REPAYMENT – View repayment\n" +
        "• HELP – Support"
      );
    }

    // ===== ONBOARDING FLOW =====
    if (step === 0) {
      await userRef.update({ onboardStep: 1, updatedAt: new Date() });
      return "Welcome to Paylite! What is your full name?";
    }

    if (step === 1) {
      await userRef.update({
        fullName: message.trim(),
        onboardStep: 2,
        updatedAt: new Date()
      });
      return "Please enter your South African ID number:";
    }

    if (step === 2) {
      await userRef.update({
        idNumber: message.trim(),
        onboardStep: 3,
        updatedAt: new Date()
      });
      return "What is your physical address?";
    }

    if (step === 3) {
      await userRef.update({
        address: message.trim(),
        onboardStep: 4,
        updatedAt: new Date()
      });
      return "Enter your electricity meter number:";
    }

    if (step === 4) {
      await userRef.update({
        meterNumber: message.trim(),
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

      return "Onboarding complete 🎉\nReply MENU to continue.";
    }

    return "Reply MENU to continue.";
  }
};
