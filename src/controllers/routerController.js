const { getUserByPhone, updateUser } = require("../services/userService");

async function routeMessage(from, message) {
    try {
        if (!from || !message) {
            return "Invalid message received. Please try again.";
        }

        const text = message.trim().toLowerCase();
        const user = await getUserByPhone(from);

        // =========================
        // NEW USER
        // =========================
        if (!user) {
            if (text === "yes") {
                return "Great 👍 What is your full name?";
            }
            return "Welcome to Paylite 👋\nReply YES to begin.";
        }

        // =========================
        // USER WITHOUT STAGE
        // =========================
        if (!user.stage) {
            return "Let’s continue your setup. What is your full name?";
        }

        // =========================
        // ACTIVE USER
        // =========================
        if (user.stage === "active") {

            // REQUEST VOUCHER
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

                return `Your voucher request has been approved ✅\nAmount: ₦${amount}\nRepayment details will be sent shortly.`;
            }

            // REPAYMENT FLOW
            if (text === "2" || text.includes("repay")) {
                if (!user.hasActiveVoucher) {
                    return "You don’t have an active voucher to repay.";
                }

                return (
                    `Your outstanding voucher is ₦${user.voucherAmount}.\n` +
                    `Reply PAID once repayment is completed.`
                );
            }

            // CONFIRM REPAYMENT
            if (text === "paid" || text === "confirm" || text === "done") {
                if (!user.hasActiveVoucher) {
                    return "No active voucher found.";
                }

                await updateUser(from, {
                    hasActiveVoucher: false,
                    voucherAmount: null,
                    voucherRequestedAt: null,
                    lastRepaidAt: new Date()
                });

                return "Payment confirmed ✅\nYou can now request a new voucher.";
            }

            return (
                "How can I help you today?\n" +
                "1. Request voucher\n" +
                "2. Repay loan"
            );
        }

        return "Something went wrong. Please try again.";

    } catch (err) {
        console.error("routeMessage error:", err);
        return "A system error occurred. Please try again later.";
    }
}

module.exports = { routeMessage };
