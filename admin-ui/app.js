const API_BASE = "/admin-api";
const TOKEN_KEY = "paylite_admin_token";

document.addEventListener("DOMContentLoaded", () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    token ? showContent() : showLogin();
    if (token) {
      loadPendingVouchers();
      loadAuditLogs();
    }
  } catch (e) {
    console.error("Init error:", e);
    showLogin();
  }
});

function showLogin() {
  document.getElementById("auth").style.display = "block";
  document.getElementById("content").style.display = "none";
}

function showContent() {
  document.getElementById("auth").style.display = "none";
  document.getElementById("content").style.display = "block";
}

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

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
  const res = await fetch(`${API_BASE}/pending-vouchers`, {
    headers: { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` }
  });

  const json = await res.json();
  const el = document.getElementById("voucherList");
  el.innerHTML = "";

  json.data.forEach(v => {
    const hasMeter = v.meterNumber && v.meterSupplier;
    el.innerHTML += `
      <div class="card">
        <p>${v.phone}</p>
        <p>R${v.voucherAmount}</p>
        <p>${hasMeter ? "✅ Meter OK" : "❌ Meter Missing"}</p>
        <button ${hasMeter ? "" : "disabled"} onclick="approve('${v.phone}')">Approve</button>
        <button onclick="reject('${v.phone}')">Reject</button>
      </div>
    `;
  });
}

async function approve(phone) {
  await action("approve-voucher", phone);
}

async function reject(phone) {
  await action("reject-voucher", phone);
}

async function action(endpoint, phone) {
  await fetch(`${API_BASE}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`
    },
    body: JSON.stringify({ phone })
  });
  loadPendingVouchers();
}

async function loadAuditLogs() {
  const res = await fetch(`${API_BASE}/audit-logs`, {
    headers: { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` }
  });
  const json = await res.json();
  const el = document.getElementById("auditLog");
  el.innerHTML = json.data.map(l => `<p>${l.action} - ${l.phone}</p>`).join("");
}async function loadAuditLogs() {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${API_BASE}/audit-logs`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const json = await res.json();
  const container = document.getElementById("auditLog");
  container.innerHTML = "";

  json.data.forEach(log => {
    container.innerHTML += `
      <p>[${new Date(log.timestamp).toLocaleString()}] ${log.action} — ${log.phone}</p>
    `;
  });
}
