const API_BASE = "/admin-api";
const TOKEN_KEY = "paylite_admin_token";

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem(TOKEN_KEY);
  token ? showContent() : showLogin();

  if (token) {
    loadPendingVouchers();
    loadScreenings();
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
  if (!json.success) return alert(json.error || "Login failed");

  localStorage.setItem(TOKEN_KEY, json.token);
  showContent();
  loadPendingVouchers();
  loadScreenings();
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

  if (!json.data.length) {
    el.innerHTML = "<p>No pending vouchers</p>";
    return;
  }

  json.data.forEach(u => {
    const hasMeter = u.meterNumber && u.meterSupplier;

    el.innerHTML += `
      <div class="card">
        <p>${u.phone}</p>
        <p>R${u.voucherAmount}</p>
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

async function loadScreenings() {
  const res = await fetch(`${API_BASE}/screenings`, {
    headers: { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` }
  });

  const json = await res.json();
  const el = document.getElementById("screeningList");
  el.innerHTML = "";

  if (!json.data.length) {
    el.innerHTML = "<p>No screenings found</p>";
    return;
  }

  json.data.forEach(s => {
    el.innerHTML += `
      <div class="card">
        <p><strong>${s.fullName}</strong> (${s.phone})</p>
        <p>Status: ${s.status}</p>
        <p>Income: ${s.monthlyIncome}</p>
      </div>
    `;
  });
}
