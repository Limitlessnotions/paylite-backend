const fs = require("fs");
const path = require("path");
const pdf = require("html-pdf");

exports.generateLoanAgreement = async (data) => {
  const templatePath = path.join(__dirname, "../../terms-ui/loan-template.html");
  let html = fs.readFileSync(templatePath, "utf8");

  Object.keys(data).forEach(key => {
    html = html.replace(new RegExp(`{{${key}}}`, "g"), data[key]);
  });

  const fileName = `loan_${data.phone}_${Date.now()}.pdf`;
  const outputPath = path.join(__dirname, "../../agreements", fileName);

  return new Promise((resolve, reject) => {
    pdf.create(html).toFile(outputPath, (err) => {
      if (err) return reject(err);
      resolve({ fileName, outputPath });
    });
  });
};
