require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const webhookRoutes = require("./src/routes/webhook");
const adminAuthRoutes = require("./src/routes/adminAuth.route");
const adminApiRoutes = require("./src/routes/admin.route");
const screeningRoutes = require("./src/routes/screening.route");

const app = express();

// =============================
// GLOBAL MIDDLEWARE
// =============================
app.use(cors());
app.use(express.json());

// =============================
// API ROUTES
// =============================

// WhatsApp (ManyChat → Backend)
app.use("/webhook", webhookRoutes);

// Admin authentication
app.use("/admin-auth", adminAuthRoutes);

// Admin protected APIs
app.use("/admin-api", adminApiRoutes);

// Screening API (form submission)
app.use("/screening-api", screeningRoutes);

// =============================
// STATIC FRONTENDS
// =============================

// Admin Dashboard UI
app.use(
  "/dashboard",
  express.static(path.join(__dirname, "admin-ui"))
);

// Public Screening Page
app.use(
  "/screening",
  express.static(path.join(__dirname, "screening-ui"))
);

// Loan Agreements (PDF / HTML downloads)
app.use(
  "/agreements",
  express.static(path.join(__dirname, "agreements"))
);

// Terms & Privacy (hosted pages)
app.use(
  "/legal",
  express.static(path.join(__dirname, "legal"))
);

// =============================
// HEALTH CHECK
// =============================
app.get("/", (req, res) => {
  res.json({
    success: true,
    service: "Paylite Backend",
    status: "running"
  });
});

// =============================
// 404 HANDLER
// =============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found"
  });
});

// =============================
// START SERVER
// =============================
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`✅ Paylite server running on port ${PORT}`);
});
