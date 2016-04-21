// server.js

"use strict";

// Load config files
var secrets = require('./config/secrets.json');
var settings = require('./config/settings.json');

// BASE SETUP
// =============================================================================
//
// call the packages we need
var Logger = require('./utilities/Logger.js');

var Express = require('express');        // call express
var App = Express();                 // define our app using express

var port = process.env.PORT || 8080;        // set our port

var mongoose = require('mongoose');
mongoose.connect(secrets.database.connection); // connect to our database


// REGISTER OUR ROUTES -------------------------------
var Routes = require('./routes.js');
App.use(settings.api.url,       Routes);
App.use(settings.client.url,    Express.static(settings.client.source_path));


// START THE SERVER
// =============================================================================
App.listen(port);
Logger.log('Serving on port ' + port);