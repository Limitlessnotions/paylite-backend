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

/* ================= UI ================= */

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

  try {
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
      el.innerHTML += `
        <div class="card">
          <p><strong>${u.phone}</strong></p>
          <p>Amount: R${u.voucherAmount}</p>
          <button onclick="approveVoucher('${u.phone}')">Approve</button>
          <button class="danger" onclick="rejectVoucher('${u.phone}')">Reject</button>
        </div>
      `;
    });

  } catch (err) {
    el.innerHTML = "<p>Error loading vouchers</p>";
  }
}

async function approveVoucher(phone) {
  await fetch(`${API_BASE}/approve-voucher`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`
    },
    body: JSON.stringify({ phone })
  });

  loadPendingVouchers();
}

async function rejectVoucher(phone) {
  await fetch(`${API_BASE}/reject-voucher`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`
    },
    body: JSON.stringify({ phone })
  });

  loadPendingVouchers();
}

/* ================= SCREENINGS ================= */

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
        <p><strong>${s.fullName || "Unknown"}</strong></p>
        <p>Phone: ${s.phone}</p>
        <p>Status: ${s.status}</p>

        ${
          s.status === "pending"
            ? `
              <button onclick="approveScreening('${s.id}')">Approve</button>
              <button class="danger" onclick="rejectScreening('${s.id}')">Reject</button>
            `
            : ""
        }
      </div>
    `;
  });
}

async function approveScreening(screeningId) {
  await screeningAction(screeningId, "approved");
}

async function rejectScreening(screeningId) {
  await screeningAction(screeningId, "rejected");
}

async function screeningAction(screeningId, decision) {
  await fetch(`${API_BASE}/screening-decision`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`
    },
    body: JSON.stringify({
      screeningId,
      decision
    })
  });

  loadScreenings();
}
