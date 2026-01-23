document.getElementById("screeningForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const idNumber = document.getElementById("idNumber").value.trim();
  const employed = document.getElementById("employed").value;
  const income = document.getElementById("income").value;
  const consent = document.getElementById("consent").checked;

  if (!consent) {
    alert("You must confirm the information is correct");
    return;
  }

  const res = await fetch("/screening/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName,
      idNumber,
      employed,
      income
    })
  });

  const json = await res.json();

  const result = document.getElementById("result");

  if (json.success) {
    result.innerText = json.message;
  } else {
    result.innerText = json.error || "Screening failed";
  }
});
