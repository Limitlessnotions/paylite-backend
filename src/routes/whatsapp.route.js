const express = require("express");
const router = express.Router();
const WhatsAppService = require("../services/whatsapp.service");

// WhatsApp webhook POST handler
router.post("/", (req, res) => {
    try {
        const { from, message } = req.body;

        console.log("Incoming:", req.body);

        const reply = WhatsAppService.processIncomingMessage(from, message);

        return res.json({
            success: true,
            reply: reply
        });
    } catch (err) {
        console.error("ERROR:", err);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
});

module.exports = router;
