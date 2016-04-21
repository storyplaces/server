// server.js

"use strict";

// Load config files
var secrets = require('./config/secrets.json');
var settings = require('./config/settings.json');

// BASE SETUP
// =============================================================================
//
// call the packages we need
var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

var mongoose = require('mongoose');
mongoose.connect(secrets.database.connection); // connect to our database


// REGISTER OUR ROUTES -------------------------------
var Routes = require('./routes.js');
app.use(settings.api.url, Routes);
app.use(settings.client.url, express.static(settings.client.source_path));


// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Serving on port ' + port);