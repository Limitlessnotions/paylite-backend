const API_BASE = "/admin-api";
const TOKEN_KEY = "paylite_admin_token";

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    showContent();
    loadPendingVouchers();
    loadAuditLogs();
  } else {
    showLogin();
  }
});

function showLogin() {
  document.getElementById("auth").classList.remove("hidden");
  document.getElementById("content").classList.add("hidden");
}

function showContent() {
  document.getElementById("auth").classList.add("hidden");
  document.getElementById("content").classList.remove("hidden");
}

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Email and password required");
    return;
  }

  const res = await fetch("/admin-auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const json = await res.json();

  if (!json.success) {
    alert(json.error || "Login failed");
    return;
  }

  localStorage.setItem(TOKEN_KEY, json.token);
  showContent();
  loadPendingVouchers();
  loadAuditLogs();
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  showLogin();
}

async function loadPendingVouchers() {
  const token = localStorage.getItem(TOKEN_KEY);

  const res = await fetch(`${API_BASE}/pending-vouchers`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const json = await res.json();
  const container = document.getElementById("voucherList");
  container.innerHTML = "";

  if (!json.data || json.data.length === 0) {
    container.innerHTML = "<p>No pending vouchers.</p>";
    return;
  }

  json.data.forEach(v => {
    const hasMeter = v.meterNumber && v.meterSupplier;

    const row = document.createElement("div");
    row.className = "card";

    row.innerHTML = `
      <p><strong>Phone:</strong> ${v.phone}</p>
      <p><strong>Amount:</strong> R${v.voucherAmount}</p>
      <p>
        <strong>Meter:</strong>
        ${hasMeter
          ? `<span class="badge success">${v.meterNumber} (${v.meterSupplier})</span>`
          : `<span class="badge danger">MISSING</span>`}
      </p>
      <p><strong>Repayment:</strong> ${v.repaymentOption}</p>

      <button ${hasMeter ? "" : "disabled"} onclick="approve('${v.phone}')">
        Approve
      </button>
      <button onclick="reject('${v.phone}')">Reject</button>
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
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ phone })
  });

  loadPendingVouchers();
}

async function loadAuditLogs() {
  const token = localStorage.getItem(TOKEN_KEY);

  const res = await fetch(`${API_BASE}/audit-logs`, {
    headers: { Authorization: `Bearer ${token}` }
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
