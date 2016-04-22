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
var StaticPages = require('./controllers/StaticPages.js');

var RequestLoggingMiddleware = require('./middleware/RequestLogging.js');
var TokenAuthMiddleware = require('./middleware/TokenAuthentication.js');
var LogErrorToConsole = require('./middleware/LogErrorToConsole.js');
var LogErrorToClient = require('./middleware/LogErrorToClient.js');

// Configure app to use BodyParser(), this will let us get the data from a POST
Router.use(BodyParser.urlencoded({extended: true}));
Router.use(BodyParser.json());

// Request logging
Router.use(RequestLoggingMiddleware);

// Test route
Router.get('/', StaticPages.rootPage);

// Routes for API

Router.route('/story')
    .get(Story.index)
    .post([TokenAuthMiddleware, Story.create]);

Router.route('/story/:story_id')
    .get(Story.fetch)
    .delete([TokenAuthMiddleware, Story.destroy]);

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

Router.route('/user')
    .post(User.create)
    .get(User.index);

// Error logging
Router.use(LogErrorToConsole);
Router.use(LogErrorToClient);

module.exports = Router;

