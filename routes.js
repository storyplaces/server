/**
 * Created by kep1u13 on 21/04/2016.
 */

"use strict";

var Express = require('express');
var Router = Express.Router();              // get an instance of the express Router
var BodyParser = require('body-parser');

var User = require('./controllers/User.js');
var Story = require('./controllers/Story.js');
var Deck = require('./controllers/Deck.js');
var Reading = require('./controllers/Reading.js');
var LogEvent = require('./controllers/LogEvent.js');
var StaticPages = require('./controllers/StaticPages.js');
var Media = require('./controllers/Media.js');

var LogRequestToConsole = require('./middleware/LogRequestToConsole.js');
var AuthenticateUsingToken = require('./middleware/TokenAuthentication.js');
var LogErrorToConsole = require('./middleware/LogErrorToConsole.js');
var LogErrorToClient = require('./middleware/LogErrorToClient.js');

// Configure app to use BodyParser(), this will let us get the data from a POST
Router.use(BodyParser.urlencoded({extended: true,limit: '3mb'}));
Router.use(BodyParser.json({limit: '3mb'}));

// Request logging
Router.use(LogRequestToConsole);

// Test route
Router.get('/', StaticPages.rootPage);

// Routes for API

Router.route('/story')
    .get(Story.index)
    .post([AuthenticateUsingToken, Story.create]);

Router.route('/story/:story_id')
    .get(Story.fetch)
	.put(Story.update)
    .delete([AuthenticateUsingToken, Story.destroy]);

Router.route('/story/:story_id/media/:media_id')
    .get(Media.fetch);

Router.route('/story/:story_id/readings')
    .get(Story.allReadings);

Router.route('/story/:story_id/readings/:user_id')
    .get(Story.readingsForUser);

Router.route('/deck/:story_id')
    .get(Deck.fetch);

Router.route('/reading')
    .post(Reading.create)
    .get(Reading.index);

Router.route('/reading/:reading_id')
    .get(Reading.fetch)
    .put(Reading.update);
	
Router.route('/logevent')
    .post(LogEvent.create)
    .get(LogEvent.index);

Router.route('/logevent/:logevent_id')
    .get(LogEvent.fetch)
    .put(LogEvent.update);
	
Router.route('/logevent/user/:user_id')
    .get(LogEvent.userFetch);

Router.route('/user')
    .post(User.create)
    .get(User.index);

// Error logging
Router.use(LogErrorToConsole);
Router.use(LogErrorToClient);

module.exports = Router;

