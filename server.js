require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const webhookRoutes = require("./src/routes/webhook");
const adminRoutes = require("./src/routes/admin.route");
const adminAuthRoutes = require("./src/routes/adminAuth.route");

// ⚠️ TEMPORARY — REMOVE AFTER ADMIN IS CREATED
const bootstrapAdminRoutes = require("./src/routes/bootstrapAdmin.route");

const app = express();

// ======================
// MIDDLEWARE
// ======================
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ======================
// HEALTH CHECK
// ======================
app.get("/", (req, res) => {
  res.json({ success: true, message: "Paylite backend running" });
});

// ======================
// ROUTES
// ======================

// WhatsApp webhook
app.use("/webhook", webhookRoutes);

// Admin authentication (login, reset, etc.)
app.use("/admin-auth", adminAuthRoutes);

// Admin protected routes (JWT)
app.use("/admin", adminRoutes);

// ⚠️ TEMPORARY BOOTSTRAP ROUTE
// REMOVE AFTER CREATING FIRST ADMIN
app.use("/bootstrap", bootstrapAdminRoutes);

// ======================
// 404 HANDLER
// ======================
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Paylite server running on port ${PORT}`);
});
