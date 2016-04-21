/**
 * Created by kep1u13 on 21/04/2016.
 */

"use strict";

var express = require('express');
var router = express.Router();              // get an instance of the express Router

var User = require('./controllers/user.js');
var Story = require('./controllers/story.js');
var Deck = require('./controllers/deck.js');
var Reading = require('./controllers/reading.js');
var StaticPages = require('./controllers/staticPages.js');

var LoggingMiddleware = require('./middleware/logging.js');
var Auth = require('./middleware/authentication.js');

// middleware to use for all requests
router.use(LoggingMiddleware.logRequest);
router.post('*', Auth.tokenAuth);
router.put('*', Auth.tokenAuth);
router.delete('*', Auth.tokenAuth);

// test route to make sure everything is working (accessed at GET http://localhost:8080/storyplaces)
router.get('/', StaticPages.rootPage);

// more routes for our API will happen here

router.route('/story')
    .post(Story.create)
    .get(Story.index);

router.route('/story/:story_id')
    .get(Story.fetch)
    .delete(Story.destroy);

router.route('/story/:story_id/readings')
    .get(Story.allReadings);

router.route('/story/:story_id/readings/:user_id')
    .get(Story.readingsForUser);

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

module.exports = router;

