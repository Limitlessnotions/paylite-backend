const API_BASE = "/admin-api";
const AUTH_BASE = "/admin-auth";
const TOKEN_KEY = "paylite_admin_jwt";

// =======================
// AUTH
// =======================
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Email and password required");
    return;
  }

  const res = await fetch(`${AUTH_BASE}/login`, {
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
  showDashboard();
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  location.reload();
}

function showDashboard() {
  document.getElementById("auth").classList.add("hidden");
  document.getElementById("content").classList.remove("hidden");
  loadPendingVouchers();
  loadAuditLogs();
}

// =======================
// API HELPERS
// =======================
function authHeaders() {
  return {
    "Authorization": `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
    "Content-Type": "application/json"
  };
}

// =======================
// PENDING VOUCHERS
// =======================
async function loadPendingVouchers() {
  const res = await fetch(`${API_BASE}/pending-vouchers`, {
    headers: authHeaders()
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

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <p><strong>Phone:</strong> ${v.phone}</p>
      <p><strong>Amount:</strong> R${v.voucherAmount}</p>

      <p>
        <strong>Meter:</strong>
        ${
          hasMeter
            ? `<span class="badge success">${v.meterNumber} (${v.meterSupplier})</span>`
            : `<span class="badge danger">MISSING</span>`
        }
      </p>

      <p><strong>Repayment:</strong> ${v.repaymentOption}</p>

      <button class="approve" ${hasMeter ? "" : "disabled"} onclick="approve('${v.phone}')">
        Approve
      </button>
      <button class="reject" onclick="reject('${v.phone}')">
        Reject
      </button>
    `;

    container.appendChild(div);
  });
}

async function approve(phone) {
  await fetch(`${API_BASE}/approve-voucher`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ phone })
  });

  loadPendingVouchers();
  loadAuditLogs();
}

async function reject(phone) {
  await fetch(`${API_BASE}/reject-voucher`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ phone })
  });

  loadPendingVouchers();
  loadAuditLogs();
}

// =======================
// AUDIT LOGS
// =======================
async function loadAuditLogs() {
  const res = await fetch(`${API_BASE}/audit-logs`, {
    headers: authHeaders()
  });

  const json = await res.json();
  const container = document.getElementById("auditLog");
  container.innerHTML = "";

  if (!json.data) return;

  json.data.forEach(log => {
    const p = document.createElement("p");
    p.textContent = `[${new Date(log.timestamp).toLocaleString()}] ${log.action} — ${log.phone}`;
    container.appendChild(p);
  });
}

// =======================
// AUTO LOGIN
// =======================
if (localStorage.getItem(TOKEN_KEY)) {
  showDashboard();
}
