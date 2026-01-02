const express = require("express");
const router = express.Router();
const { routeMessage } = require("../controllers/routerController");

router.post("/", (req, res) => {
    const from = req.body.from;
    const message = req.body.message;

    const reply = routeMessage(from, message);

    return res.json({
        success: true,
        reply: reply
    });
});

module.exports = router;
