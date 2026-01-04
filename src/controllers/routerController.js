const {
    getUserByPhone,
    createUser,
    updateUser
} = require("../services/userService");

/**
 * Main message router
 * @param {string} from - phone number
 * @param {string} message - incoming message
 */
async function routeMessage(from, message) {
    try {
        // =========================
        // HARD VALIDATION
        // =========================
        if (!from || !message) {
            return "Invalid message received. Please try again.";
        }

        const text = message.trim().toLowerCase();

        // =========================
        // FETCH OR CREATE USER
        // =========================
        let user = await getUserByPhone(from);

        if (!user) {
            await createUser(from);
            return "Welcome to Paylite 👋\nReply YES to begin.";
        }

        // =========================
        // BLOCKED USER
        // =========================
        if (user.stage === "blocked") {
            return "Your account is currently restricted. Please contact support.";
        }

        // =========================
        // ONBOARDING FLOW
        // =========================
        if (user.stage === "onboarding") {

            // Step 1: Ask to begin
            if (!user.fullName) {
                if (text === "yes") {
                    return "Great 👍 What is your full name?";
                }

                return "Welcome to Paylite 👋\nReply YES to begin.";
            }

            // Step 2: Collect full name
            if (!user.activatedAt) {
                if (text
