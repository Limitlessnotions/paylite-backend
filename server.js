const express = require("express");
const cors = require("cors");

const webhookRoute = require("./src/routes/webhook");
const adminRoutes = require("./src/routes/admin.route");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Webhook (WhatsApp / Meta)
app.use("/webhook", webhookRoute);

// Admin API (JSON)
app.use("/admin-api", adminRoutes);

// Admin UI (static site)
app.use("/admin", express.static("admin-ui"));

app.get("/", (req, res) => {
  res.send("Paylite backend is running");
});

app.listen(PORT, () => {
  console.log(`Paylite server running on port ${PORT}`);
});
