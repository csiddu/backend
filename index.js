var express = require('express');
var app = express();

const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage()
})
app.use(upload.any())


const router = express.Router();

require("dotenv").config();
const CORS = require("cors")
app.use(CORS())

const PORT = process.env.PORT || 3000

const { events } = require('./handlers/events')
const { teams } = require('./handlers/teams')
const { links } = require('./handlers/links')
const { admins } = require('./handlers/admins')

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.json({extended: false}))
app.use(bodyParser.json());

app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', ' Content-Type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.use('/admins', admins);

app.get('/events', events);
app.get('/teams', teams);
app.get('/links', links);


app.get('/', (req, res) => {
    res.send('Hello to the CSI Backend!')
  })
  
app.listen(PORT, function () {
    console.log(`CSI Backend app is listening on port: ${PORT}!`); 
  });
