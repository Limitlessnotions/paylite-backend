const API_BASE = "/admin-api";
const TOKEN_KEY = "paylite_admin_token";

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    showContent();
    loadPendingVouchers();
    loadScreenings();
  } else {
    showLogin();
  }
});

/* ================= UI HELPERS ================= */

function showLogin() {
  document.getElementById("auth").style.display = "block";
  document.getElementById("content").style.display = "none";
}

function showContent() {
  document.getElementById("auth").style.display = "none";
  document.getElementById("content").style.display = "block";
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  showLogin();
}

/* ================= AUTH ================= */

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
  loadScreenings();
}

/* ================= VOUCHERS ================= */

async function loadPendingVouchers() {
  const el = document.getElementById("voucherList");
  el.innerHTML = "<p>Loading...</p>";

  const res = await fetch(`${API_BASE}/pending-vouchers`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`
    }
  });

  const json = await res.json();
  el.innerHTML = "";

  if (!json.success || !json.data || !json.data.length) {
    el.innerHTML = "<p>No pending vouchers</p>";
    return;
  }

  json.data.forEach(u => {
    const hasMeter = u.meterNumber && u.meterSupplier;

    el.innerHTML += `
      <div class="card">
        <p><strong>${u.phone}</strong></p>
        <p>Amount: R${u.voucherAmount}</p>
        <p>${hasMeter ? "✅ Meter OK" : "❌ Meter Missing"}</p>
        <button ${hasMeter ? "" : "disabled"} onclick="approve('${u.phone}')">Approve</button>
        <button onclick="reject('${u.phone}')">Reject</button>
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

/* ================= SCREENINGS (M3-2) ================= */

async function loadScreenings() {
  const el = document.getElementById("screeningList");
  el.innerHTML = "<p>Loading...</p>";

  const res = await fetch(`${API_BASE}/screenings`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`
    }
  });

  const json = await res.json();
  el.innerHTML = "";

  if (!json.success || !json.data || !json.data.length) {
    el.innerHTML = "<p>No screening records found</p>";
    return;
  }

  json.data.forEach(s => {
    el.innerHTML += `
      <div class="card">
        <p><strong>${s.fullName}</strong></p>
        <p>Phone: ${s.phone}</p>
        <p>Income: ${s.monthlyIncome}</p>
        <p>Status: ${s.status}</p>
      </div>
    `;
  });
}
