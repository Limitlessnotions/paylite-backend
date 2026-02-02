const { db } = require("../services/firebase");

module.exports = {
  handleOnboarding: async function (from, message) {
    const text = message.trim().toLowerCase();
    const userRef = db.collection("users").doc(from);
    let snap = await userRef.get();

    if (!snap.exists) {
      await userRef.set({
        phone: from,
        onboardStep: 0,
        onboarded: false,
        popiaConsent: false,
        termsAccepted: false,
        screeningStatus: "pending",
        creditApproved: false,
        blocked: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      snap = await userRef.get();
    }

    const user = snap.data();
    const step = user.onboardStep || 0;

    // STEP 0 — POPIA CONSENT
    if (step === 0) {
      await userRef.update({ onboardStep: 1 });
      return (
        "Welcome to Paylite.\n\n" +
        "We collect and process your personal information in accordance with POPIA.\n\n" +
        "Reply YES to consent and continue."
      );
    }

    if (step === 1) {
      if (text !== "yes") {
        return "You must consent to POPIA to continue. Reply YES.";
      }
      await userRef.update({
        popiaConsent: true,
        onboardStep: 2
      });
      return "Please enter your full name:";
    }

    // STEP 2 — NAME
    if (step === 2) {
      await userRef.update({
        fullName: message,
        onboardStep: 3
      });
      return "Please enter your South African ID number:";
    }

    // STEP 3 — ID
    if (step === 3) {
      await userRef.update({
        idNumber: message,
        onboardStep: 4
      });
      return "Please enter your physical address:";
    }

    // STEP 4 — ADDRESS
    if (step === 4) {
      await userRef.update({
        address: message,
        onboardStep: 5
      });
      return "Enter your electricity meter number:";
    }

    // STEP 5 — METER
    if (step === 5) {
      await userRef.update({
        meterNumber: message,
        onboardStep: 6
      });
      return (
        "Please review our Terms & Conditions:\n" +
        "https://paylite.co.za/terms\n\n" +
        "Reply YES to accept."
      );
    }

    // STEP 6 — T&C
    if (step === 6) {
      if (text !== "yes") {
        return "You must accept the Terms & Conditions to continue. Reply YES.";
      }

      await userRef.update({
        termsAccepted: true,
        onboardStep: 7
      });

      return (
        "Screening Step (Required)\n\n" +
        "What is your current employer?\n\n" +
        "⚠️ If unemployed or not receiving a pension, reply NONE."
      );
    }

    // STEP 7 — EMPLOYER (SCREENING DECISION)
    if (step === 7) {
      const employer = message.trim();

      if (employer.toLowerCase() === "none") {
        await userRef.update({
          screeningStatus: "rejected",
          creditApproved: false,
          blocked: true,
          onboarded: true,
          onboardStep: 99,
          updatedAt: new Date()
        });

        return (
          "Unfortunately, you do not qualify for Paylite at this time.\n\n" +
          "Reason: No employment or pension income."
        );
      }

      // Save screening record
      await db.collection("screenings").add({
        phone: from,
        employer,
        status: "pending",
        createdAt: new Date()
      });

      await userRef.update({
        screeningStatus: "pending",
        onboarded: true,
        onboardStep: 99,
        updatedAt: new Date()
      });

      return (
        "Thank you.\n\n" +
        "Your details have been submitted for screening.\n" +
        "You will be notified once reviewed."
      );
    }

    return "Please wait while your account is being reviewed.";
  }
};
