const { db } = require("../services/firebase");
const {
    createVoucherRequest,
    updateVoucherStatus
} = require("../services/voucherService");

const {
    updateUserBalance,
    setUserBlocked
} = require("../services/userService");

module.exports = {

    // Handles the user entering an amount
    requestVoucherAmount: async function (from, message) {
        const amount = parseInt(message);

        // Validate amount
        if (isNaN(amount) || amount < 20 || amount > 2000) {
            return "Please enter a valid amount between R20 and R2000.";
        }

        const userRef = db.collection("users").doc(from);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            return "Please complete onboarding to continue.";
        }

        const user = userSnap.data();

        // If they owe money → block
        if (user.blocked) {
            return "You have an unpaid balance. Please repay before requesting a new voucher.";
        }

        // Calculate fees
        const earlyFee = Math.round(amount * 0.05);
        const extendedFee = Math.round(amount * 0.12);

        // Save pending voucher in user document
        await userRef.set({
            pendingVoucher: {
                amount,
                stage: "awaiting_confirmation"
            },
            updatedAt: new Date()
        }, { merge: true });

        // Add to vouchers collection
        await createVoucherRequest(from, amount, null, "pending");

        return (
            `You requested an electricity voucher of R${amount}.\n\n` +
            "Choose a repayment option:\n" +
            `1. Early Repayment (24 hrs): Fee R${earlyFee}\n` +
            `2. Extended Repayment (7 days): Fee R${extendedFee}\n\n` +
            "Reply with 1 or 2 to confirm."
        );
    },

    // Handles the user selecting repayment option
    confirmRepaymentOption: async function (from, message) {
        const option = parseInt(message);

        // Validate option
        if (![1, 2].includes(option)) {
            return "Invalid option. Reply 1 for early repayment or 2 for extended repayment.";
        }

        const userRef = db.collection("users").doc(from);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            return "Please type MENU to restart.";
        }

        const user = userSnap.data();
        const request = user.pendingVoucher;

        if (!request || request.stage !== "awaiting_confirmation") {
            return "You have no pending voucher request. Reply MENU.";
        }

        // Block user + set balance
        await userRef.set({
            blocked: true,
            balance: request.amount,
            pendingVoucher: {
                ...request,
                option,
                stage: "completed"
            },
            updatedAt: new Date()
        }, { merge: true });

        // Get latest voucher record for this user
        const voucherSnap = await db.collection("vouchers")
            .where("userPhone", "==", from)
            .orderBy("createdAt", "desc")
            .limit(1)
            .get();

        if (!voucherSnap.empty) {
            const doc = voucherSnap.docs[0];
            await updateVoucherStatus(doc.id, {
                option,
                status: "approved"
            });
        }

        // Update user state via service functions
        await setUserBlocked(from, true);
        await updateUserBalance(from, request.amount);

        return (
            "Your request has been approved.\n\n" +
            `Voucher Amount: R${request.amount}\n` +
            `Repayment Option: ${option === 1 ? "Early (24 hrs)" : "Extended (7 days)"}\n\n` +
            "Your voucher will be processed shortly.\n" +
            "You are temporarily blocked until your repayment is completed."
        );
    }
};
