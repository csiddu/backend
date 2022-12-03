var express = require('express');
var app = express();
require("dotenv").config();
const PORT = process.env.PORT || 3000
const { events } = require('./handlers/events')
const { teams } = require('./handlers/teams')
const { links } = require('./handlers/links')

app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.get('/events', events);
app.get('/teams', teams);
app.get('/links', links);

app.get('/', (req, res) => {
    res.send('Hello to the CSI Backend!')
  })
  
app.listen(PORT, function () {
    console.log(`CSI Backend app is listening on port: ${PORT}!`); });
