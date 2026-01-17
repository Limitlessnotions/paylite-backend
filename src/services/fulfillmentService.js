async function fulfillElectricity({ meterNumber, amount, reference }) {
  console.log("Electricity fulfillment:", {
    meterNumber,
    amount,
    reference
  });

  // Placeholder for Flash / provider
  return {
    success: true,
    token: "1234 5678 9012",
    units: amount
  };
}

module.exports = { fulfillElectricity };
