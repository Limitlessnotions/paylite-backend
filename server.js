require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const webhookRoutes = require("./src/routes/webhook");
const adminRoutes = require("./src/routes/admin.route");
const adminAuthRoutes = require("./src/routes/adminAuth.route");
const screeningRoutes = require("./src/routes/screening.route");

const app = express();

app.use(cors());
app.use(express.json());

/**
 * ========= API ROUTES =========
 */
app.use("/webhook", webhookRoutes);
app.use("/api/admin-auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/screening", screeningRoutes);

/**
 * ========= ADMIN UI =========
 * (THIS MUST NOT BE PROTECTED)
 */
app.use(
  "/admin",
  express.static(path.join(__dirname, "admin-ui"))
);

/**
 * ========= HEALTH =========
 */
app.get("/", (req, res) => {
  res.json({ success: true, message: "Paylite backend running" });
});

/**
 * ========= 404 =========
 */
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Paylite running on ${PORT}`);
});
