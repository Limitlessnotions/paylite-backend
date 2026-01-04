const {
    getUserByPhone,
    createUser,
    updateUser
} = require("../services/userService");

async function routeMessage(from, message) {
    try {
        if (!from || !message) {
            return "Invalid message received. Please try again.";
        }

        const text = message.trim().toLowerCase();

        // Fetch user
        let user = await getUserByPhone(from);

        // =========================
        // NEW USER
        // =========================
        if (!user) {
            if (text === "yes") {
                await createUser(from);
                return "Great 👍 What is your full name?";
            }

            return "Welcome to Paylite 👋\nReply YES to begin.";
        }

        // =========================
        // ONBOARDING (FULL NAME)
        // =========================
        if (user.stage === "onboarding") {
            if (text.length < 3) {
                return "Please enter a valid full name.";
            }

            await updateUser(from, {
                fullName: message,
                stage: "active",
                activatedAt: new Date(),
                hasActiveVoucher: false,
                voucherAmount: null,
                voucherRequestedAt: null
            });

            return (
                `Thanks ${message} 🎉\n` +
                "Your account is now active.\n\n" +
                "How can I help you today?\n" +
                "1. Request voucher\n" +
                "2. Repay loan"
            );
        }

        // =========================
        // ACTIVE USER
        // =========================
        if (user.stage === "active") {
            // Request voucher
            if (text === "1" || text.includes("voucher")) {
                if (user.hasActiveVoucher) {
                    return "You already have an active voucher. Please repay it before requesting another.";
                }

                const amount = 1000; // configurable later

                await updateUser(from, {
                    hasActiveVoucher: true,
                    voucherAmount: amount,
                    voucherRequestedAt: new Date()
                });

                return (
                    "Your voucher request has been approved ✅\n" +
                    `Amount: ₦${amount}\n` +
                    "Repayment details will be sent shortly."
                );
            }

            // Repay
            if (text === "2" || text.includes("repay")) {
                if (!user.hasActiveVoucher) {
                    return "You don’t have an active voucher to repay.";
                }

                return (
                    `Your current voucher is ₦${user.voucherAmount}.\n` +
                    "Repayment options will be sent shortly."
                );
            }

            return (
                "How can I help you today?\n" +
                "1. Request voucher\n" +
                "2. Repay loan"
            );
        }

        // =========================
        // BLOCKED USER
        // =========================
        if (user.stage === "blocked") {
            return "Your account is currently restricted. Please contact support.";
        }

        return "Something went wrong. Please try again later.";

    } catch (error) {
        console.error("routeMessage error:", error);
        return "A system error occurred. Please try again later.";
    }
}

module.exports = { routeMessage };
