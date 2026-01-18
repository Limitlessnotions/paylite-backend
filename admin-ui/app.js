// ✅ RELATIVE API PATH — DO NOT USE FULL URL
const API_BASE = "/admin-api";
const TOKEN_KEY = "paylite_admin_token";

function saveToken() {
  const token = document.getElementById("tokenInput").value;
  if (!token) return alert("Token required");

  localStorage.setItem(TOKEN_KEY, token);
  document.getElementById("auth").classList.add("hidden");
  document.getElementById("content").classList.remove("hidden");

  loadPendingVouchers();
  loadAuditLogs();
}

async function loadPendingVouchers() {
  const token = localStorage.getItem(TOKEN_KEY);

  const res = await fetch(`${API_BASE}/pending-vouchers`, {
    headers: { "x-admin-token": token }
  });

  const json = await res.json();
  const container = document.getElementById("voucherList");
  container.innerHTML = "";

  if (!json.data || json.data.length === 0) {
    container.innerHTML = "<p>No pending vouchers.</p>";
    return;
  }

  json.data.forEach(v => {
    const row = document.createElement("div");
    row.className = "row";

    row.innerHTML = `
      <span>${v.phone}</span>
      <span>R${v.voucherAmount}</span>
      <span class="pending">Pending</span>
      <span>
        <button onclick="approve('${v.phone}')">Approve</button>
        <button onclick="reject('${v.phone}')">Reject</button>
      </span>
    `;

    container.appendChild(row);
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
  loadAuditLogs();
}

async function loadAuditLogs() {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${API_BASE}/audit-logs`, {
    headers: { "x-admin-token": token }
  });

  const json = await res.json();
  const container = document.getElementById("auditLog");
  container.innerHTML = "";

  json.data.forEach(log => {
    container.innerHTML += `
      <p>[${new Date(log.timestamp).toLocaleString()}]
      ${log.action} — ${log.phone}</p>
    `;
  });
}

// Auto restore session
if (localStorage.getItem(TOKEN_KEY)) {
  document.getElementById("auth").classList.add("hidden");
  document.getElementById("content").classList.remove("hidden");
  loadPendingVouchers();
  loadAuditLogs();
}
