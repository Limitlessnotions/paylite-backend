require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const webhookRoutes = require("./src/routes/webhook");
const adminApiRoutes = require("./src/routes/admin.route");
const adminAuthRoutes = require("./src/routes/adminAuth.route");

const app = express();

app.use(cors());
app.use(express.json());

/**
 * 1️⃣ PUBLIC UI (NO AUTH)
 * Must come BEFORE any /admin-api logic
 */
app.use("/admin", express.static(path.join(__dirname, "admin-ui")));

/**
 * 2️⃣ AUTH
 */
app.use("/admin-auth", adminAuthRoutes);

/**
 * 3️⃣ JWT-PROTECTED ADMIN API
 */
app.use("/admin-api", adminApiRoutes);

/**
 * 4️⃣ WEBHOOK
 */
app.use("/webhook", webhookRoutes);

/**
 * Health
 */
app.get("/", (_, res) =>
  res.json({ success: true, message: "Paylite backend running" })
);

/**
 * 404
 */
app.use((_, res) =>
  res.status(404).json({ success: false, error: "Route not found" })
);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
  console.log(`Paylite server running on port ${PORT}`)
);
