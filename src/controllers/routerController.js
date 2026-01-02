const { db } = require("../services/firebase");
const { handleOnboarding } = require("./onboardingController");
const { requestVoucherAmount, confirmRepaymentOption } = require("./voucherController");
const { getUserByPhone } = require("../services/userService");

module.exports = {
    routeMessage: async function (from, message) {

        const text = (message || "").trim().toLowerCase();

        // 1. Fetch user from Firestore
        let user = await getUserByPhone(from);

        // 2. If no user or not onboarded → Onboarding flow
        if (!user || !user.onboarded) {
            return await handleOnboarding(from, message);
        }

        // 3. Check if user is blocked due to unpaid balance
        if (user.blocked) {
            return (
                "Your account is blocked due to unpaid balance.\n\n" +
                "Please repay your outstanding amount to continue."
            );
        }

        // 4. Check if selecting repayment option for existing voucher
        if (user.pendingVoucher && user.pendingVoucher.stage === "awaiting_confirmation") {
            return await confirmRepaymentOption(from, message);
        }

        // 5. Menu
        if (text === "menu" || text === "hi" || text === "hello") {
            return (
                "Welcome back to Paylite.\n\n" +
                "Choose an option:\n" +
                "1. Request Electricity Voucher\n" +
                "2. Check Balance\n" +
                "3. Repay Debt\n" +
                "4. Contact Support"
            );
        }

        // 6. Request Voucher
        if (text.startsWith("1")) {
            return "Please enter the voucher amount you want to request (R20 to R2000).";
        }

        // 7. User typed a number → treat as voucher amount (if valid)
        if (!isNaN(parseInt(text))) {
            return await requestVoucherAmount(from, message);
        }

        // 8. Check balance
        if (text.startsWith("2")) {
            const balance = user.balance || 0;

            return (
                `Your current balance is: R${balance}.\n\n` +
                "Reply MENU to return."
            );
        }

        // 9. Repay debt (placeholder)
        if (text.startsWith("3")) {
            if (user.balance <= 0) {
                return "You have no outstanding repayments.\n\nReply MENU.";
            }

            return (
                "We are generating your repayment link...\n\n" +
                "You will receive it shortly."
            );
        }

        // 10. Support
        if (text.startsWith("4")) {
            return (
                "Support is available Monday–Friday, 08:00–17:00.\n\n" +
                "Reply MENU to return."
            );
        }

        // 11. Fallback
        return "I didn't understand that. Reply MENU to continue.";
    }
};
