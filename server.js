const express = require("express");
const cors = require("cors");
const app = express();

// Routes
const webhookRoute = require("./src/routes/webhook");
const adminRoute = require("./src/routes/admin.route");
const adminAuthRoutes = require("./src/routes/adminAuth.route");

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
  res.send("Paylite Backend is running.");
});

// 🔐 Admin auth (login)
app.use("/admin-auth", adminAuthRoutes);

// Admin (JWT-protected)
app.use("/admin", adminRoute);

// Webhook (WhatsApp)
app.use("/webhook", webhookRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Paylite server running on port ${PORT}`);
});
