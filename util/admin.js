const admin = require('firebase-admin');
require("dotenv").config();

const serviceAccount = JSON.parse(process.env.serviceAccount);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { admin, db };