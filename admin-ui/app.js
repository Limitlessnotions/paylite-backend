// IMPORTANT:
// Since the admin UI is served from the SAME Express server,
// we use a RELATIVE PATH instead of the full Render URL.
const API_BASE = "/admin";
const TOKEN_KEY = "paylite_admin_token";

// Save admin token and unlock UI
function saveToken() {
  const token = document.getElementById("tokenInput").value;
  if (!token) {
    alert("Admin token is required");
    return;
  }

  localStorage.setItem(TOKEN_KEY, token);

  document.getElementById("auth").classList.add("hidden");
  document.getElementById("content").classList.remove("hidden");

  loadPendingVouchers();
}

// Load pending voucher requests
async function loadPendingVouchers() {
  const token = localStorage.getItem(TOKEN_KEY);

  const res = await fetch(`${API_BASE}/pending-vouchers`, {
    headers: {
      "x-admin-token": token
    }
  });

  if (!res.ok) {
    alert("Unauthorized or failed to fetch data");
    return;
  }

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

// Approve voucher
async function approve(phone) {
  await adminAction("approve-voucher", phone);
}

// Reject voucher
async function reject(phone) {
  const reason = prompt("Enter rejection reason:");
  if (!reason) return;

  await adminAction("reject-voucher", phone, { reason });
}

// Shared admin action handler
async function adminAction(endpoint, phone, extra = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  await fetch(`${API_BASE}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": token
    },
    body: JSON.stringify({ phone, ...extra })
  });

  loadPendingVouchers();
}

// Auto-restore admin session if token exists
if (localStorage.getItem(TOKEN_KEY)) {
  document.getElementById("auth").classList.add("hidden");
  document.getElementById("content").classList.remove("hidden");
  loadPendingVouchers();
}
