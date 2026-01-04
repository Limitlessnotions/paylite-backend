if (user.stage === "active") {
    // Request voucher
    if (text === "1" || text.includes("voucher")) {
        if (user.hasActiveVoucher) {
            return "You already have an active voucher. Please repay it before requesting another.";
        }

        const amount = 1000; // test amount; configurable later

        await updateUser(from, {
            hasActiveVoucher: true,
            voucherAmount: amount,
            voucherRequestedAt: new Date()
        });

        return `Your voucher request has been approved ✅\nAmount: ₦${amount}\nWe’ll send next steps shortly.`;
    }

    // Repay
    if (text === "2" || text.includes("repay")) {
        if (!user.hasActiveVoucher) {
            return "You don’t have an active voucher to repay.";
        }
        return `Your current voucher is ₦${user.voucherAmount}. Repayment options will be sent shortly.`;
    }

    return (
        "How can I help you today?\n" +
        "1. Request voucher\n" +
        "2. Repay loan"
    );
}
