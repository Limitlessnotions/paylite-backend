require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const adminAuthRoutes = require("./src/routes/adminAuth.route");
const adminApiRoutes = require("./src/routes/admin.route");
const webhookRoutes = require("./src/routes/webhook");

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// ===== API Routes =====
app.use("/webhook", webhookRoutes);
app.use("/admin-auth", adminAuthRoutes);
app.use("/admin-api", adminApiRoutes);

// ===== Admin Dashboard UI =====
app.use(
  "/dashboard",
  express.static(path.join(__dirname, "admin-ui"))
);

// ===== Public Screening UI =====
app.use(
  "/screening",
  express.static(path.join(__dirname, "screening-ui"))
);

// ===== Root health check =====
app.get("/", (req, res) => {
  res.json({ success: true, message: "Paylite backend running" });
});

// ===== 404 =====
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// ===== Start =====
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Paylite server running on port ${PORT}`);
});
