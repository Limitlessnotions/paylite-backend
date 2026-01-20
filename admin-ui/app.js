async function loadPendingVouchers() {
  const token = localStorage.getItem(TOKEN_KEY);

  const res = await fetch(`${API_BASE}/pending-vouchers`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const json = await res.json();
  const container = document.getElementById("voucherList");
  container.innerHTML = "";

  if (!json.data || json.data.length === 0) {
    container.innerHTML = "<p>No pending vouchers.</p>";
    return;
  }

  json.data.forEach(v => {
    const div = document.createElement("div");
    div.className = "card";

    const hasMeter = v.meterNumber && v.meterSupplier;

    div.innerHTML = `
      <p><strong>Phone:</strong> ${v.phone}</p>
      <p><strong>Amount:</strong> R${v.voucherAmount}</p>
      <p>
        <strong>Meter:</strong>
        ${hasMeter
          ? `<span class="badge success">${v.meterNumber} (${v.meterSupplier})</span>`
          : `<span class="badge danger">MISSING</span>`}
      </p>
      <p><strong>Repayment:</strong> ${v.repaymentOption}</p>

      <button
        class="approve"
        ${hasMeter ? "" : "disabled"}
        onclick="approve('${v.phone}')"
      >
        Approve
      </button>

      <button class="reject" onclick="reject('${v.phone}')">
        Reject
      </button>
    `;

    container.appendChild(div);
  });
}
