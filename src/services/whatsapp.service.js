// src/services/whatsapp.service.js

class WhatsAppService {
    static processIncomingMessage(from, message) {
        // For now, return a simple response (placeholder)
        return `Received '${message}' from ${from}`;
    }
}

module.exports = WhatsAppService;
