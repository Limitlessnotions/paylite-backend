const express = require("express");
const router = express.Router();
const { routeMessage } = require("../controllers/routerController");

router.post("/", async (req, res) => {
  try {
    const { from, message } = req.body;
    const reply = await routeMessage(from, message);

    res.json({ success: true, reply });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
