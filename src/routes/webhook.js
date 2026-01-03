const express = require("express");
const router = express.Router();
const { routeMessage } = require("../controllers/routerController");

router.post("/", async (req, res) => {
    try {
        const from = req.body.from;
        const message = req.body.message;

        const reply = await routeMessage(from, message);

        return res.json({
            success: true,
            reply
        });
    } catch (err) {
        console.error("Webhook error:", err);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
});

module.exports = router;
