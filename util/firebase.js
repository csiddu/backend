const firebase = require('firebase');
require("dotenv").config();

var firebaseConfig = process.env.firebaseConfig;

firebase.initializeApp(firebaseConfig);

module.exports = { firebase };