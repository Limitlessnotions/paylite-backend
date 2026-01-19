require("dotenv").config();
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  )
});

const db = admin.firestore();

async function createAdmin() {
  const email = "owner@paylite.com";
  const plainPassword = "CHANGE_THIS_PASSWORD";

  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const adminId = uuidv4();

  await db.collection("admins").doc(adminId).set({
    email,
    passwordHash,
    role: "super_admin",
    isActive: true,
    createdAt: new Date()
  });

  console.log("✅ Admin created");
  console.log("Email:", email);
  console.log("Password:", plainPassword);
  process.exit(0);
}

createAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
