const admin = require("firebase-admin");
const serviceAccount = require("./enrollsmart-130e2-firebase-adminsdk-fbsvc-315ef61a30.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

module.exports = admin;