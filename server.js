require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const webhookRoutes = require("./src/routes/webhook");
const adminRoutes = require("./src/routes/admin.route");
const adminAuthRoutes = require("./src/routes/adminAuth.route");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ===== ROUTES =====

// Webhooks
app.use("/webhook", webhookRoutes);

// Admin auth (login)
app.use("/admin-auth", adminAuthRoutes);

// Admin API (JWT protected)
app.use("/admin-api", adminRoutes);

// Admin UI (STATIC — NO AUTH HERE)
app.use("/admin", express.static(path.join(__dirname, "admin-ui")));

// Health check
app.get("/", (req, res) => {
  res.json({ success: true, message: "Paylite backend running" });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Paylite server running on port ${PORT}`);
});
