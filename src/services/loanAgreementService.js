const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

async function generateLoanAgreement(user, voucherAmount, repaymentOption) {
  return new Promise((resolve, reject) => {
    try {
      const fileName = `loan_${user.phone}_${Date.now()}.pdf`;
      const filePath = path.join(__dirname, "../../agreements", fileName);

      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // ===== CONTENT =====
      doc.fontSize(18).text("PAYLITE LOAN AGREEMENT", { align: "center" });
      doc.moveDown(2);

      doc.fontSize(12).text(`Borrower Name: ${user.fullName}`);
      doc.text(`Phone Number: ${user.phone}`);
      doc.text(`ID Number: ${user.idNumber}`);
      doc.moveDown();

      doc.text(`Loan Amount: R${voucherAmount}`);
      doc.text(
        `Repayment Option: ${
          repaymentOption === "early" ? "24 Hours" : "7 Days"
        }`
      );
      doc.text(`Agreement Date: ${new Date().toLocaleDateString()}`);
      doc.moveDown();

      doc.text(
        "This agreement confirms that the borrower agrees to repay the electricity credit issued by Paylite under the selected repayment terms."
      );
      doc.moveDown();

      doc.text(
        "Failure to repay may result in service suspension and further recovery actions in line with South African regulations."
      );
      doc.moveDown(3);

      doc.text("Borrower Signature: __________________________");
      doc.moveDown();
      doc.text("Paylite Representative: _____________________");

      doc.end();

      stream.on("finish", () => {
        resolve({
          fileName,
          filePath
        });
      });
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateLoanAgreement };
