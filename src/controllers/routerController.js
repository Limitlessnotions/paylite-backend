const {
  getUserByPhone,
  createUser,
  updateUser,
} = require("../services/userService");

async function routeMessage(from, message) {
  try {
    // ===== Hard validation =====
    if (!from || !message) {
      return "Invalid message received. Please try again.";
    }

    const phone = String(from).trim();
    if (!phone) {
      return "Invalid sender number.";
    }

    const rawText = String(message).trim();
    const text = rawText.toLowerCase();

    // ===== Fetch user safely =====
    const user = await getUserByPhone(phone);

    // =========================
    // NEW USER (no record)
    // =========================
    if (!user) {
      if (text === "yes") {
        await createUser({
          phone,
          stage: "onboarding",
          createdAt: new Date().toISOString(),
        });

        return "Great 👍 What is your full name?";
      }

      return "Welcome to Paylite 👋\nReply YES to begin.";
    }

    // =========================
    // USER EXISTS BUT NO STAGE
    // =========================
    if (!user.stage) {
      await updateUser(phone, { stage: "onboarding" });
      return "Let’s continue your setup. What is your full name?";
    }

    // =========================
    // STAGE-BASED ROUTING
    // =========================
    switch (user.stage) {
      case "onboarding":
        return await handleOnboarding(user, rawText);

      case "active":
        return handleActiveUser(user, text);

      case "blocked":
        return "Your account is currently restricted. Please contact support.";

      default:
        return "Something went wrong on our side. Please try again shortly.";
    }
  } catch (error) {
    console.error("routeMessage error:", error);
    return "A system error occurred. Please try again later.";
  }
}

// ===== Onboarding handler (FINAL) =====
async function handleOnboarding(user, rawText) {
  const fullName = rawText.trim();

  if (fullName.length < 3) {
    return "Please enter a valid full name.";
  }

  await updateUser(user.phone, {
    fullName,
    stage: "active",
    activatedAt: new Date().toISOString(),
  });

  return (
    `Thanks ${fullName} 🎉\n` +
    "Your account is now active.\n\n" +
    "How can I help you today?\n" +
    "1. Request voucher\n" +
    "2. Repay loan"
  );
}

// ===== Active user handler (FINAL) =====
function handleActiveUser(user, text) {
  if (text === "1" || text.includes("voucher")) {
    return "Voucher request received. Processing...";
  }

  if (text === "2" || text.includes("repay")) {
    return "Repayment options will be sent shortly.";
  }

  return (
    "How can I help you today?\n" +
    "1. Request voucher\n" +
    "2. Repay loan"
  );
}

module.exports = { routeMessage };
