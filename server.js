require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const webhookRoutes = require("./src/routes/webhook");
const adminRoutes = require("./src/routes/admin.route");
const adminAuthRoutes = require("./src/routes/adminAuth.route");

const app = express();

// ✅ MUST COME BEFORE ROUTES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/webhook", webhookRoutes);
app.use("/admin-auth", adminAuthRoutes);
app.use("/admin", adminRoutes);

// Serve Admin UI (STATIC)
app.use("/admin", express.static(path.join(__dirname, "admin-ui")));

// Health check
app.get("/", (req, res) => {
  res.json({ success: true, message: "Paylite backend running" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Paylite server running on port ${PORT}`);
});
