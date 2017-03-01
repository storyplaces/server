

"use strict";

var Express = require('express');
var Router = Express.Router();              // get an instance of the express Router
var BodyParser = require('body-parser');

var User = require('./controllers/User.js');
var Story = require('./controllers/Story.js');
var Reading = require('./controllers/Reading.js');
var LogEvent = require('./controllers/LogEvent.js');
var StaticPages = require('./controllers/StaticPages.js');
var Media = require('./controllers/Media.js');

var AuthoringStory = require('./controllers/AuthoringStory.js');
var AuthoringUser = require('./controllers/AuthoringUser.js');

var LogRequestToConsole = require('./middleware/LogRequestToConsole.js');
var AuthenticateUsingToken = require('./middleware/TokenAuthentication.js');
var LogErrorToConsole = require('./middleware/LogErrorToConsole.js');
var LogErrorToClient = require('./middleware/LogErrorToClient.js');

Router.use(function (req, res, next) {
    if (['POST', 'PUT', 'PATCH'].indexOf(req.method.toUpperCase()) != -1) {
        var contentType = req.headers['content-type'];
        if (!contentType || contentType.indexOf('application/json') !== 0) {
            return res.send(400);
        }
    }
    next();
});

// Configure app to use BodyParser(), this will let us get the data from a POST
Router.use(BodyParser.urlencoded({extended: true, limit: '3mb'}));
Router.use(BodyParser.json({limit: '3mb'}));

Router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Auth-Token");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
    next();
});

// Request logging
Router.use(LogRequestToConsole);

// Test route
Router.get('/', StaticPages.rootPage);

// Routes for Reading API

Router.route('/story')
    .get(Story.index)
    .post([AuthenticateUsingToken, Story.create]);

Router.route('/story/:story_id')
    .get(Story.fetch)
    .put([AuthenticateUsingToken, Story.update])
    .delete([AuthenticateUsingToken, Story.destroy]);

Router.route('/story/:story_id/media/:media_id')
    .get(Media.fetch);

Router.route('/reading')
    .post(Reading.create)
    .get([AuthenticateUsingToken, Reading.index]);

Router.route('/reading/story/:story_id/user/:user_id')
    .get(Story.readingsForUser);

Router.route('/reading/story/:story_id')
    .get([AuthenticateUsingToken, Story.allReadings]);

Router.route('/reading/:reading_id')
    .get(Reading.fetch)
    .put(Reading.update);

Router.route('/logevent')
    .post(LogEvent.create)
    .get([AuthenticateUsingToken, LogEvent.index]);

Router.route('/logevent/:logevent_id')
    .get([AuthenticateUsingToken, LogEvent.fetch])
    .put(LogEvent.update);

Router.route('/logevent/user/:user_id')
    .get([AuthenticateUsingToken, LogEvent.userFetch]);

Router.route('/user')
    .post(User.create)
    .get([AuthenticateUsingToken, User.index]);

// Routes for Authoring Tool API

// Get a list of stories
// Create a new story
Router.route('/authoring/story')
    .get(AuthoringStory.index)
    .post(AuthoringStory.create);

// Get an individual story
// Update a story
Router.route('/authoring/story/:story_id')
    .get(AuthoringStory.fetch)
    .put(AuthoringStory.update);

// Publish a story
Router.route('/authoring/story/:story_id/publish')
    .get(AuthoringStory.publish);

// Get stories for AuthoringUser
Router.route('/authoring/story/user/:user_id')
    .get(AuthoringStory.userFetch);

// Create AuthoringUser
// Get list of AuthoringUsers
Router.route('/authoring/user')
    .post(AuthoringUser.create)
    .get(AuthoringUser.index);

// Get AuthoringUser
// Update AuthoringUser
Router.route('/authoring/user/:user_id')
    .put(AuthoringUser.update)
    .get(AuthoringUser.fetch);

// Error logging
Router.use(LogErrorToConsole);
Router.use(LogErrorToClient);

module.exports = Router;

