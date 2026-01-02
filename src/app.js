// src/app.js
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// default route
app.get("/", (req, res) => {
  res.send("Paylite backend running...");
});

// mount whatsapp route if exists (safe require)
try {
  const whatsappRoute = require("./routes/whatsapp.route");
  app.use("/webhook/whatsapp", whatsappRoute);
} catch (err) {
  // route may not exist yet — log and continue
  console.warn("whatsapp.route not loaded:", err.message);
}

module.exports = app;
