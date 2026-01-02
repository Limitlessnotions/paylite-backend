const { db } = require("../services/firebase");

module.exports = {
    handleOnboarding: async function (from, message) {
        const userRef = db.collection("users").doc(from);
        let snap = await userRef.get();

        // If user doesn't exist, create them
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
        let step = user.onboardStep || 0;

        // Step 0 — Ask for name
        if (step === 0) {
            await userRef.set({
                onboardStep: 1,
                updatedAt: new Date()
            }, { merge: true });

            return "Welcome to Paylite! Let's get you set up.\n\nWhat is your full name?";
        }

        // Step 1 — Save name
        if (step === 1) {
            await userRef.set({
                fullName: message.trim(),
                onboardStep: 2,
                updatedAt: new Date()
            }, { merge: true });

            return "Great. Please enter your South African ID number:";
        }

        // Step 2 — Save ID number
        if (step === 2) {
            await userRef.set({
                idNumber: message.trim(),
                onboardStep: 3,
                updatedAt: new Date()
            }, { merge: true });

            return "Got it. What is your physical address?";
        }

        // Step 3 — Save Address
        if (step === 3) {
            await userRef.set({
                address: message.trim(),
                onboardStep: 4,
                updatedAt: new Date()
            }, { merge: true });

            return "Please enter your electricity meter number:";
        }

        // Step 4 — Save Meter number
        if (step === 4) {
            await userRef.set({
                meterNumber: message.trim(),
                onboardStep: 5,
                updatedAt: new Date()
            }, { merge: true });

            return "Final question: Do you agree to Paylite's Terms & Conditions? Reply YES to continue.";
        }

        // Step 5 — Consent
        if (step === 5) {
            if (message.toLowerCase() !== "yes") {
                return "You must agree to the Terms & Conditions to continue. Reply YES to proceed.";
            }

            await userRef.set({
                onboarded: true,
                onboardStep: 99,
                updatedAt: new Date()
            }, { merge: true });

            return "Your onboarding is complete! 🎉\n\nReply MENU to begin using Paylite.";
        }

        return "You are already onboarded. Reply MENU.";
    }
};
