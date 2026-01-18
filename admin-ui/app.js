const API_BASE = "https://paylite-backend.onrender.com/admin";
const TOKEN_KEY = "paylite_admin_token";

function saveToken() {
  const token = document.getElementById("tokenInput").value;
  if (!token) return alert("Token required");

  localStorage.setItem(TOKEN_KEY, token);
  document.getElementById("auth").classList.add("hidden");
  document.getElementById("content").classList.remove("hidden");

  loadPendingVouchers();
}

async function loadPendingVouchers() {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${API_BASE}/pending-vouchers`, {
    headers: {
      "x-admin-token": token
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

    div.innerHTML = `
      <p><strong>Phone:</strong> ${v.phone}</p>
      <p><strong>Amount:</strong> R${v.voucherAmount}</p>
      <p><strong>Repayment:</strong> ${v.repaymentOption}</p>
      <button class="approve" onclick="approve('${v.phone}')">Approve</button>
      <button class="reject" onclick="reject('${v.phone}')">Reject</button>
    `;

    container.appendChild(div);
  });
}

async function approve(phone) {
  await action("approve-voucher", phone);
}

async function reject(phone) {
  await action("reject-voucher", phone);
}

async function action(endpoint, phone) {
  const token = localStorage.getItem(TOKEN_KEY);

  await fetch(`${API_BASE}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": token
    },
    body: JSON.stringify({ phone })
  });

  loadPendingVouchers();
}

// Auto-restore session
if (localStorage.getItem(TOKEN_KEY)) {
  document.getElementById("auth").classList.add("hidden");
  document.getElementById("content").classList.remove("hidden");
  loadPendingVouchers();
}
