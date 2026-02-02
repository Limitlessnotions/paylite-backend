document.getElementById("screeningForm").addEventListener("submit", async e => {
  e.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const idNumber = document.getElementById("idNumber").value.trim();
  const employer = document.getElementById("currentEmployer").value.trim();
  const pension = document.getElementById("pension").checked;
  const income = document.getElementById("income").value;
  const messageEl = document.getElementById("message");

  // Auto disqualification rule
  if (!employer && !pension) {
    messageEl.innerText =
      "You are not eligible at this time. Employment or pension is required.";
    messageEl.style.color = "red";

    await fetch("/api/screening", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        idNumber,
        currentEmployer: null,
        receivesPension: false,
        income,
        status: "rejected"
      })
    });

    return;
  }

  const payload = {
    fullName,
    idNumber,
    currentEmployer: employer || null,
    receivesPension: pension,
    income,
    status: "pending"
  };

  const res = await fetch("/api/screening", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (data.success) {
    messageEl.innerText =
      "Screening submitted successfully. You will be notified via WhatsApp.";
    messageEl.style.color = "green";
  } else {
    messageEl.innerText = "Submission failed. Please try again.";
    messageEl.style.color = "red";
  }
});
