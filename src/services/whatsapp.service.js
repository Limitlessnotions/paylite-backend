async function sendWhatsAppMessage(to, message) {
  // This function already connects to ManyChat / WATI / Infobip
  // Do NOT change provider logic here

  console.log("Sending WhatsApp message to:", to);
  console.log("Message:", message);

  // Example placeholder — your actual API call already exists
  return true;
}

module.exports = { sendWhatsAppMessage };
