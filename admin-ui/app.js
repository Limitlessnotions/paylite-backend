const API_BASE = "/admin";
const TOKEN_KEY = "paylite_admin_token";

let vouchers = [];
let audits = [];

function login() {
  const token = document.getElementById("tokenInput").value;
  if (!token) return alert("Token required");

  localStorage.setItem(TOKEN_KEY, token);
  document.getElementById("auth").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");

  loadData();
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  location.reload();
}

async function loadData() {
  await loadVouchers();
  await loadAuditLogs();
}

async function loadVouchers() {
  const res = await fetch(`${API_BASE}/pending-vouchers`, {
    headers: { "x-admin-token": localStorage.getItem(TOKEN_KEY) }
  });

  const json = await res.json();
  vouchers = json.data || [];
  renderTable();
}

function renderTable() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const status = document.getElementById("statusFilter").value;

  const body = document.getElementById("tableBody");
  body.innerHTML = "";

  vouchers
    .filter(v =>
      v.phone.toLowerCase().includes(search) &&
      (status === "all" || v.voucherStatus === status)
    )
    .forEach(v => {
      body.innerHTML += `
        <tr>
          <td>${v.phone}</td>
          <td>R${v.voucherAmount}</td>
          <td><span class="badge ${v.voucherStatus}">${v.voucherStatus}</span></td>
          <td>
            <button onclick="approve('${v.phone}')">Approve</button>
            <button onclick="reject('${v.phone}')">Reject</button>
          </td>
        </tr>
      `;
    });
}

async function approve(phone) {
  await action("approve-voucher", phone);
}

async function reject(phone) {
  const reason = prompt("Reason?");
  if (!reason) return;
  await action("reject-voucher", phone, { reason });
}

async function action(endpoint, phone, extra = {}) {
  await fetch(`${API_BASE}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": localStorage.getItem(TOKEN_KEY)
    },
    body: JSON.stringify({ phone, ...extra })
  });

  loadVouchers();
}
