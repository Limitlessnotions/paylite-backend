const API_BASE = "/admin-api";
const TOKEN_KEY = "paylite_admin_token";

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    showLogin();
    return;
  }

  showContent();
  loadPendingVouchers();
  loadAuditLogs();
  loadScreenings(); // ✅ M3-2
});

// ===== UI STATE =====
function showLogin() {
  document.getElementById("auth").style.display = "block";
  document.getElementById("content").style.display = "none";
}

function showContent() {
  document.getElementById("auth").style.display = "none";
  document.getElementById("content").style.display = "block";
}

// ===== AUTH =====
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
  loadScreenings();
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  location.reload();
}

// ===== VOUCHERS =====
async function loadPendingVouchers() {
  const res = await fetch(`${API_BASE}/pending-vouchers`, {
    headers: { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` }
  });

  if (res.status === 401) return logout();

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

// ===== AUDIT LOGS =====
async function loadAuditLogs() {
  const res = await fetch(`${API_BASE}/audit-logs`, {
    headers: { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` }
  });

  if (res.status === 401) return logout();

  const json = await res.json();
  const container = document.getElementById("auditLog");
  container.innerHTML = "";

  json.data.forEach(log => {
    container.innerHTML += `
      <p>[${new Date(log.timestamp).toLocaleString()}] ${log.action} — ${log.phone}</p>
    `;
  });
}

// ===== SCREENINGS (M3-2) =====
async function loadScreenings() {
  const res = await fetch(`${API_BASE}/screenings`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`
    }
  });

  if (res.status === 401) return logout();

  const json = await res.json();
  const container = document.getElementById("screeningList");
  container.innerHTML = "";

  if (!json.success || !json.data.length) {
    container.innerHTML = "<p>No screening records found.</p>";
    return;
  }

  json.data.forEach(s => {
    container.innerHTML += `
      <div class="card">
        <p><strong>Name:</strong> ${s.fullName}</p>
        <p><strong>Phone:</strong> ${s.phone}</p>
        <p><strong>ID:</strong> ${s.idNumber}</p>
        <p><strong>Employed:</strong> ${s.employed ? "Yes" : "No"}</p>
        <p><strong>Income:</strong> ${s.monthlyIncome}</p>
        <p><strong>Status:</strong> ${s.status}</p>
        <p><strong>Date:</strong> ${
          s.createdAt?.toDate
            ? new Date(s.createdAt.toDate()).toLocaleString()
            : "—"
        }</p>
      </div>
    `;
  });
}
