const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");

// Load Firebase Admin (via firebase.js service)
const { db } = require("./src/services/firebase");

// Routes
const webhookRoute = require("./src/routes/webhook");
const adminRoute = require("./src/routes/admin.route");

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Test route
app.get("/", (req, res) => {
    res.send("Paylite Backend is running (M2).");
});

// Webhook + Admin routes
app.use("/webhook", webhookRoute);
app.use("/admin", adminRoute);

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({ success: false, error: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Paylite server running on port ${PORT}`);
});
