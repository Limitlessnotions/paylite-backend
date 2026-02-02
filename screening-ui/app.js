// ===============================
// FORCE GREEN UI STYLING VIA JS
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  document.body.style.margin = "0";
  document.body.style.padding = "0";
  document.body.style.background = "#0b3d2e";
  document.body.style.fontFamily = "Arial, sans-serif";
  document.body.style.display = "flex";
  document.body.style.justifyContent = "center";
  document.body.style.alignItems = "center";
  document.body.style.minHeight = "100vh";

  const container = document.querySelector(".container");
  if (container) {
    container.style.background = "#0f5132";
    container.style.padding = "24px";
    container.style.borderRadius = "10px";
    container.style.width = "100%";
    container.style.maxWidth = "360px";
    container.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
    container.style.color = "#ffffff";
  }

  document.querySelectorAll("input, select, button").forEach(el => {
    el.style.width = "100%";
    el.style.marginTop = "6px";
    el.style.marginBottom = "14px";
    el.style.padding = "10px";
    el.style.borderRadius = "5px";
    el.style.border = "none";
    el.style.fontSize = "14px";
  });

  document.querySelectorAll("label").forEach(label => {
    label.style.fontSize = "13px";
    label.style.marginTop = "10px";
    label.style.display = "block";
  });

  const button = document.querySelector("button");
  if (button) {
    button.style.background = "#198754";
    button.style.color = "#ffffff";
    button.style.cursor = "pointer";
    button.style.fontWeight = "bold";
  }
});

// ===============================
// SCREENING SUBMISSION LOGIC
// ===============================
document.getElementById("screeningForm").addEventListener("submit", async e => {
  e.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const idNumber = document.getElementById("idNumber").value.trim();
  const employer = document.getElementById("currentEmployer").value.trim();
  const pension = document.getElementById("pension").checked;
  const income = document.getElementById("income").value;
  const messageEl = document.getElementById("message");

  messageEl.style.marginTop = "10px";
  messageEl.style.fontSize = "14px";

  // ===============================
  // AUTO DISQUALIFICATION RULE
  // ===============================
  if (!employer && !pension) {
    messageEl.innerText =
      "You are not eligible at this time. Employment or pension is required.";
    messageEl.style.color = "#ffb3b3";

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

  // ===============================
  // NORMAL SUBMISSION
  // ===============================
  const payload = {
    fullName,
    idNumber,
    currentEmployer: employer || null,
    receivesPension: pension,
    income,
    status: "pending"
  };

  try {
    const res = await fetch("/api/screening", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success) {
      messageEl.innerText =
        "Screening submitted successfully. You will be notified via WhatsApp.";
      messageEl.style.color = "#b6fcd5";
    } else {
      throw new Error();
    }
  } catch {
    messageEl.innerText = "Submission failed. Please try again.";
    messageEl.style.color = "#ffb3b3";
  }
});
