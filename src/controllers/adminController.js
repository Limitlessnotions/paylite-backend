const { listUsers } = require("../services/userService");
const { listVouchers } = require("../services/voucherService");
const { listRepayments } = require("../services/repaymentService");

module.exports = {

    // JSON: List all users
    getUsers: async (req, res) => {
        try {
            const users = await listUsers();
            res.json({ success: true, data: users });
        } catch (err) {
            console.error("getUsers error:", err);
            res.status(500).json({ success: false, error: "Internal server error" });
        }
    },

    // JSON: List all vouchers
    getVouchers: async (req, res) => {
        try {
            const vouchers = await listVouchers();
            res.json({ success: true, data: vouchers });
        } catch (err) {
            console.error("getVouchers error:", err);
            res.status(500).json({ success: false, error: "Internal server error" });
        }
    },

    // JSON: List all repayments
    getRepayments: async (req, res) => {
        try {
            const repayments = await listRepayments();
            res.json({ success: true, data: repayments });
        } catch (err) {
            console.error("getRepayments error:", err);
            res.status(500).json({ success: false, error: "Internal server error" });
        }
    },

    // HTML ADMIN DASHBOARD
    getDashboard: async (req, res) => {
        try {
            const [users, vouchers, repayments] = await Promise.all([
                listUsers(20),
                listVouchers(20),
                listRepayments(20)
            ]);

            const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Paylite Admin Dashboard</title>
    <meta charset="utf-8" />
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f4f4f4; }
        h1 { margin-bottom: 10px; }
        h2 { margin-top: 30px; }
        table { border-collapse: collapse; width: 100%; background: #fff; }
        th, td { border: 1px solid #ddd; padding: 6px; font-size: 14px; }
        th { background: #222; color: #fff; }
        tr:nth-child(even) { background: #f9f9f9; }
        .badge { padding: 3px 6px; border-radius: 4px; font-size: 12px; }
        .badge-blocked { background: #d9534f; color: #fff; }
        .badge-ok { background: #5cb85c; color: #fff; }
    </style>
</head>
<body>

<h1>Paylite Admin Dashboard (M2)</h1>

<h2>Users</h2>
<table>
    <tr>
        <th>Phone</th>
        <th>Name</th>
        <th>ID Number</th>
        <th>Balance</th>
        <th>Blocked</th>
        <th>Onboarded</th>
    </tr>
    ${users.map(u => `
    <tr>
        <td>${u.id}</td>
        <td>${u.fullName || "-"}</td>
        <td>${u.idNumber || "-"}</td>
        <td>R${u.balance || 0}</td>
        <td>
            <span class="badge ${u.blocked ? "badge-blocked" : "badge-ok"}">
                ${u.blocked ? "YES" : "NO"}
            </span>
        </td>
        <td>${u.onboarded ? "YES" : "NO"}</td>
    </tr>`).join("")}
</table>

<h2>Vouchers</h2>
<table>
    <tr>
        <th>ID</th>
        <th>User</th>
        <th>Amount</th>
        <th>Option</th>
        <th>Status</th>
        <th>Date</th>
    </tr>
    ${vouchers.map(v => `
    <tr>
        <td>${v.id}</td>
        <td>${v.userPhone}</td>
        <td>R${v.amount}</td>
        <td>${v.option || "-"}</td>
        <td>${v.status}</td>
        <td>${v.createdAt ? new Date(v.createdAt.toDate()).toLocaleString() : "-"}</td>
    </tr>`).join("")}
</table>

<h2>Repayments</h2>
<table>
    <tr>
        <th>ID</th>
        <th>User</th>
        <th>Voucher</th>
        <th>Amount</th>
        <th>Status</th>
        <th>Date</th>
    </tr>
    ${repayments.map(r => `
    <tr>
        <td>${r.id}</td>
        <td>${r.userPhone}</td>
        <td>${r.voucherId || "-"}</td>
        <td>R${r.amount}</td>
        <td>${r.status}</td>
        <td>${r.createdAt ? new Date(r.createdAt.toDate()).toLocaleString() : "-"}</td>
    </tr>`).join("")}
</table>

</body>
</html>
            `;

            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.send(html);

        } catch (err) {
            console.error("Dashboard error:", err);
            res.status(500).send("Admin dashboard failed to load.");
        }
    }
};
