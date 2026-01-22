const API_BASE = "/admin";
const AUTH_BASE = "/admin-auth";
const TOKEN_KEY = "paylite_admin_token";

/* =========================
   LOGIN
========================= */
async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Email and password required");
    return;
  }

  const res = await fetch(`${AUTH_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!data.success) {
    alert(data.error || "Login failed");
    return;
  }

  localStorage.setItem(TOKEN_KEY, data.token);
  location.reload();
}

/* =========================
   AUTH GUARD
========================= */
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function authHeaders() {
  return {
    "Authorization": `Bearer ${getToken()}`,
    "Content-Type": "application/json"
  };
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  location.reload();
}

/* =========================
   LOAD VOUCHERS
========================= */
async function loadPendingVouchers() {
  const res = await fetch(`${API_BASE}/pending-vouchers`, {
    headers: authHeaders()
  });

  const json = await res.json();
  const container = document.getElementById("voucherList");
  container.innerHTML = "";

  if (!json.data || json.data.length === 0) {
    container.innerHTML = "<p>No pending vouchers</p>";
    return;
  }

  json.data.forEach(v => {
    const hasMeter = v.meterNumber && v.meterSupplier;

    const row = document.createElement("div");
    row.className = "card";

    row.innerHTML = `
      <div><strong>${v.phone}</strong></div>
      <div>R${v.voucherAmount}</div>
      <div>
        ${hasMeter
          ? `<span class="badge success">${v.meterNumber} (${v.meterSupplier})</span>`
          : `<span class="badge danger">MISSING METER</span>`}
      </div>
      <div>
        <button ${hasMeter ? "" : "disabled"} onclick="approve('${v.phone}')">
          Approve
        </button>
        <button class="danger" onclick="reject('${v.phone}')">
          Reject
        </button>
      </div>
    `;

    container.appendChild(row);
  });
}

/* =========================
   ACTIONS
========================= */
async function approve(phone) {
  await fetch(`${API_BASE}/approve-voucher`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ phone })
  });

  loadPendingVouchers();
}

async function reject(phone) {
  await fetch(`${API_BASE}/reject-voucher`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ phone })
  });

  loadPendingVouchers();
}

/* =========================
   BOOT
========================= */
window.onload = () => {
  if (!getToken()) {
    document.getElementById("loginBox").style.display = "block";
    document.getElementById("dashboard").style.display = "none";
  } else {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    loadPendingVouchers();
  }
};
