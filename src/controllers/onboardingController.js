const { db } = require("../services/firebase");

module.exports = {
  handleOnboarding: async function (from, message) {
    const text = message.trim().toLowerCase();
    const userRef = db.collection("users").doc(from);
    let snap = await userRef.get();

    // =========================
    // CREATE USER IF NEW
    // =========================
    if (!snap.exists) {
      await userRef.set({
        onboardStep: 0,
        onboarded: false,

        // Compliance
        popiaConsent: false,
        termsAccepted: false,

        // Account state
        balance: 0,
        blocked: false,
        creditApproved: false,

        createdAt: new Date(),
        updatedAt: new Date()
      });

      snap = await userRef.get();
    }

    const user = snap.data();
    const step = user.onboardStep || 0;

    // =========================
    // GLOBAL COMMANDS (ALWAYS WORK)
    // =========================
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

    // =========================
    // ONBOARDING FLOW
    // =========================

    // STEP 0 — Ask name
    if (step === 0) {
      await userRef.update({
        onboardStep: 1,
        updatedAt: new Date()
      });

      return "Welcome to Paylite! What is your full name?";
    }

    // STEP 1 — Save name
    if (step === 1) {
      await userRef.update({
        fullName: message.trim(),
        onboardStep: 2,
        updatedAt: new Date()
      });

      return "Please enter your South African ID number:";
    }

    // STEP 2 — Save ID
    if (step === 2) {
      await userRef.update({
        idNumber: message.trim(),
        onboardStep: 3,
        updatedAt: new Date()
      });

      return "What is your physical address?";
    }

    // STEP 3 — Save address
    if (step === 3) {
      await userRef.update({
        address: message.trim(),
        onboardStep: 4,
        updatedAt: new Date()
      });

      return "Please enter your electricity meter number:";
    }

    // STEP 4 — Save meter number
    if (step === 4) {
      await userRef.update({
        meterNumber: message.trim(),
        onboardStep: 5,
        updatedAt: new Date()
      });

      return (
        "POPIA Consent 📄\n\n" +
        "Paylite will collect and process your personal data " +
        "in line with South Africa’s POPIA.\n\n" +
        "Reply YES to give consent."
      );
    }

    // STEP 5 — POPIA CONSENT
    if (step === 5) {
      if (text !== "yes") {
        return "You must reply YES to provide POPIA consent.";
      }

      await userRef.update({
        popiaConsent: true,
        popiaConsentAt: new Date(),
        onboardStep: 6,
        updatedAt: new Date()
      });

      return (
        "Terms & Conditions 📜\n\n" +
        "Please review our Terms & Conditions:\n" +
        "https://paylite.co.za/terms\n\n" +
        "Reply YES to accept."
      );
    }

    // STEP 6 — TERMS & CONDITIONS
    if (step === 6) {
      if (text !== "yes") {
        return "You must reply YES to accept the Terms & Conditions.";
      }

      await userRef.update({
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        termsVersion: "2025-01-13",

        onboarded: true,
        onboardStep: 99,
        updatedAt: new Date()
      });

      return (
        "Onboarding complete 🎉\n\n" +
        "You can now request electricity on credit.\n\n" +
        "Reply MENU to continue."
      );
    }

    // =========================
    // FALLBACK
    // =========================
    return "Reply MENU to continue.";
  }
};
