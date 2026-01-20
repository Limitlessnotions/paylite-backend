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

/**
 * =========================
 * ADMIN UI (STATIC)
 * =========================
 * This MUST come before /admin API routes
 */
app.use(
  "/admin",
  express.static(path.join(__dirname, "admin-ui"))
);

/**
 * =========================
 * AUTH ROUTES
 * =========================
 */
app.use("/admin-auth", adminAuthRoutes);

/**
 * =========================
 * ADMIN API ROUTES
 * =========================
 */
app.use("/admin", adminRoutes);

/**
 * =========================
 * WEBHOOK ROUTES
 * =========================
 */
app.use("/webhook", webhookRoutes);

/**
 * =========================
 * HEALTH CHECK
 * =========================
 */
app.get("/", (req, res) => {
  res.json({ success: true, message: "Paylite backend running" });
});

/**
 * =========================
 * 404 HANDLER
 * =========================
 */
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

/**
 * =========================
 * START SERVER
 * =========================
 */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Paylite server running on port ${PORT}`);
});
