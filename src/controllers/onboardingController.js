const { db } = require("../services/firebase");

async function handleOnboarding(from, message) {
  const text = message.trim();

  const userRef = db.collection("users").doc(from);
  let snap = await userRef.get();

  if (!snap.exists) {
    await userRef.set({
      phone: from,
      onboardStep: 0,
      onboarded: false,
      blocked: false,
      createdAt: new Date()
    });
    snap = await userRef.get();
  }

  const user = snap.data();
  const step = user.onboardStep || 0;

  if (step === 0) {
    await userRef.update({ onboardStep: 1 });
    return "Welcome to Paylite 👋\nWhat is your full name?";
  }

  if (step === 1) {
    await userRef.update({
      fullName: text,
      onboardStep: 2
    });
    return "Enter your South African ID number:";
  }

  if (step === 2) {
    await userRef.update({
      idNumber: text,
      onboardStep: 3
    });
    return "Enter your physical address:";
  }

  if (step === 3) {
    await userRef.update({
      address: text,
      onboardStep: 4
    });
    return "Enter your electricity meter number:";
  }

  if (step === 4) {
    if (!/^\d{7,13}$/.test(text)) {
      return "❌ Invalid meter number. Must be 7–13 digits.";
    }

    await userRef.update({
      meterNumber: text,
      onboardStep: 5
    });

    return (
      "Please review our Terms & Conditions:\n" +
      "https://paylite.co.za/terms\n\n" +
      "Reply YES to accept."
    );
  }

  if (step === 5) {
    if (text.toLowerCase() !== "yes") {
      return "You must reply YES to continue.";
    }

    await userRef.update({
      onboarded: true,
      onboardStep: 99,
      termsAccepted: true,
      termsAcceptedAt: new Date()
    });

    return "✅ Onboarding complete!\nReply MENU to continue.";
  }

  return "Reply MENU to continue.";
}

module.exports = { handleOnboarding };
