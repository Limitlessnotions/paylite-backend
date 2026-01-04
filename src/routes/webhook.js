const express = require("express");
const router = express.Router();
const { routeMessage } = require("../controllers/routerController");

router.post("/", async (req, res) => {
    try {
        const { from, message } = req.body;

        const reply = await routeMessage(from, message);

        return res.json({
            success: true,
            reply
        });
    } catch (error) {
        console.error("Webhook error:", error);

        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
});

module.exports = router;
