const { db } = require("./firebase");
const { v4: uuidv4 } = require("uuid");

/**
 * Generates a loan agreement record (NO PDF in M4)
 * PDF generation is deferred to M5
 */
async function generateLoanAgreement({ phone, amount, repaymentOption }) {
  const agreementId = uuidv4();

  const agreement = {
    id: agreementId,
    phone,
    amount,
    repaymentOption,
    status: "active",
    createdAt: new Date(),
    version: "v1.0",
    type: "electricity_voucher_loan"
  };

  await db.collection("loanAgreements").doc(agreementId).set(agreement);

  return {
    id: agreementId,
    url: `https://paylite-backend.onrender.com/agreement/${agreementId}`
  };
}

module.exports = {
  generateLoanAgreement
};
