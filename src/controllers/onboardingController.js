const { db } = require("../services/firebase");

module.exports = {
  handleOnboarding: async function (from, message) {
    const text = message.trim();
    const userRef = db.collection("users").doc(from);
    let snap = await userRef.get();

    // =========================
    // CREATE USER IF NEW
    // =========================
    if (!snap.exists) {
      await userRef.set({
        phone: from,
        onboardStep: 0,
        onboarded: false,

        // Consent handled later (voucher time)
        popiaConsent: false,
        termsAccepted: false,
        awaitingConsent: false,

        // Screening
        screeningStatus: "not_started",
        creditApproved: false,

        // Voucher state
        blocked: false,

        createdAt: new Date(),
        updatedAt: new Date()
      });

      snap = await userRef.get();
    }

    const user = snap.data();
    const step = user.onboardStep || 0;

    // =========================
    // STEP 0 — INTRO
    // =========================
    if (step === 0) {
      await userRef.update({
        onboardStep: 1,
        updatedAt: new Date()
      });

      return (
        "Welcome to Paylite ⚡\n\n" +
        "Let’s get you registered.\n\n" +
        "What is your full name?"
      );
    }

    // =========================
    // STEP 1 — FULL NAME
    // =========================
    if (step === 1) {
      await userRef.update({
        fullName: text,
        onboardStep: 2,
        updatedAt: new Date()
      });

      return "Please enter your South African ID number:";
    }

    // =========================
    // STEP 2 — ID NUMBER
    // =========================
    if (step === 2) {
      await userRef.update({
        idNumber: text,
        onboardStep: 3,
        updatedAt: new Date()
      });

      return "Please enter your physical address:";
    }

    // =========================
    // STEP 3 — ADDRESS
    // =========================
    if (step === 3) {
      await userRef.update({
        address: text,
        onboardStep: 4,
        updatedAt: new Date()
      });

      return "Please enter your electricity meter number:";
    }

    // =========================
    // STEP 4 — METER NUMBER
    // =========================
    if (step === 4) {
      await userRef.update({
        meterNumber: text,
        onboardStep: 5,
        updatedAt: new Date()
      });

      return (
        "Screening step (required)\n\n" +
        "What is your current employer?\n\n" +
        "⚠️ If unemployed or not receiving a pension, reply NONE."
      );
    }

    // =========================
    // STEP 5 — EMPLOYER (SCREENING)
    // =========================
    if (step === 5) {
      const employer = text.toLowerCase();

      // ❌ Auto-disqualify
      if (employer === "none") {
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

      // ✅ Save screening submission
      await db.collection("screenings").add({
        phone: from,
        employer: text,
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

    // =========================
    // DEFAULT
    // =========================
    return "Please wait while your account is being reviewed.";
  }
};
