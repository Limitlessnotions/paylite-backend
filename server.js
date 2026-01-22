require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const webhookRoutes = require("./src/routes/webhook");
const adminApiRoutes = require("./src/routes/admin.route");
const adminAuthRoutes = require("./src/routes/adminAuth.route");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ===== API ROUTES =====
app.use("/webhook", webhookRoutes);
app.use("/admin-auth", adminAuthRoutes);
app.use("/admin-api", adminApiRoutes);

// ===== ADMIN UI (STATIC) =====
app.use(
  "/admin",
  express.static(path.join(__dirname, "admin-ui"))
);

// Default admin UI entry
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin-ui", "index.html"));
});

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
