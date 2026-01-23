require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const webhookRoutes = require("./src/routes/webhook");
const adminRoutes = require("./src/routes/admin.route");
const adminAuthRoutes = require("./src/routes/adminAuth.route");
const screeningRoutes = require("./src/routes/screening.route");

const app = express();

/**
 * ======================
 * GLOBAL MIDDLEWARE
 * ======================
 */
app.use(cors());
app.use(express.json());

/**
 * ======================
 * API ROUTES
 * ======================
 */
app.use("/webhook", webhookRoutes);          // WhatsApp → Backend
app.use("/admin-auth", adminAuthRoutes);     // Admin login (JWT)
app.use("/admin", adminRoutes);               // Admin dashboard APIs
app.use("/screening", screeningRoutes);       // M3 Credit screening

/**
 * ======================
 * ADMIN UI (STATIC SITE)
 * ======================
 */
app.use(
  "/admin",
  express.static(path.join(__dirname, "admin-ui"))
);

/**
 * ======================
 * HEALTH CHECK
 * ======================
 */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Paylite backend running"
  });
});

/**
 * ======================
 * 404 HANDLER
 * ======================
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found"
  });
});

/**
 * ======================
 * START SERVER
 * ======================
 */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Paylite server running on port ${PORT}`);
});
