const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// Serve admin UI
app.use("/admin", express.static(path.join(__dirname, "admin-ui")));

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin-ui", "index.html"));
});

// API routes
app.use("/webhook", require("./src/routes/webhook"));
app.use("/admin-api", require("./src/routes/admin.route"));

app.get("/", (req, res) => {
  res.send("Paylite Backend is running.");
});

// 404 handler LAST
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
