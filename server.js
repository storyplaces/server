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

var CoreSchema = require('./models/coreschema');

var User = require('./controllers/user.js');
var Story = require('./controllers/story.js');
var Deck = require('./controllers/deck.js');
var Reading = require('./controllers/reading.js');


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function (req, res, next) {
    // do logging
    console.log('Request Made ' + req.method + ' ' + req.path);
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/storyplaces)
router.get('/', function (req, res) {
    res.json({message: 'This is the storyplaces api'});
});

// more routes for our API will happen here

router.route('/story')
    .post(Story.create)
    .get(Story.index);

router.route('/story/:story_id')
    .get(Story.fetch)
    .delete(Story.destroy);

router.route('/story/:story_id/readings')
    .get(function (req, res) {
        CoreSchema.Reading.find({"story": req.params.story_id}, function (err, readings) {
            if (err) {
                res.send(err);
            }
            res.json(readings);
        });
    });

router.route('/story/:story_id/readings/:user_id')
    .get(function (req, res) {
        CoreSchema.Reading.find({"story": req.params.story_id, "user": req.params.user_id}, function (err, readings) {
            if (err) {
                res.send(err);
            }
            res.json(readings);
        });
    });

router.route('/deck/:story_id')
    .get(Deck.fetch);

router.route('/reading')
    .post(Reading.create)
    .get(Reading.index);

router.route('/reading/:reading_id')
    .get(Reading.fetch)
    .put(Reading.update);

router.route('/user')
    .post(User.create)
    .get(User.index);

// REGISTER OUR ROUTES -------------------------------
app.use('/storyplaces', router);
app.use(express.static(settings.client.source_path));


// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Serving on port ' + port);