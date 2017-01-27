/* *****************************************************************************
 *
 * StoryPlaces
 *

This application was developed as part of the Leverhulme Trust funded 
StoryPlaces Project. For more information, please visit storyplaces.soton.ac.uk

Copyright (c) 2016
  University of Southampton
    Charlie Hargood, cah07r.ecs.soton.ac.uk
    Kevin Puplett, k.e.puplett.soton.ac.uk
	David Pepper, d.pepper.soton.ac.uk

All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * The name of the Universities of Southampton nor the name of its 
	  contributors may be used to endorse or promote products derived from 
	  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE ABOVE COPYRIGHT HOLDERS BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

***************************************************************************** */

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

var AuthoringStory = require('./controllers/AuthoringStory.js');
var AuthoringUser = require('./controllers/AuthoringUser.js');

var LogRequestToConsole = require('./middleware/LogRequestToConsole.js');
var AuthenticateUsingToken = require('./middleware/TokenAuthentication.js');
var LogErrorToConsole = require('./middleware/LogErrorToConsole.js');
var LogErrorToClient = require('./middleware/LogErrorToClient.js');

// Configure app to use BodyParser(), this will let us get the data from a POST
Router.use(BodyParser.urlencoded({extended: true,limit: '3mb'}));
Router.use(BodyParser.json({limit: '3mb'}));

Router.use(function(req, res, next) {
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

Router.route('/reading/story/:story_id/user/:user_id')
    .get(Story.readingsForUser);

Router.route('/reading/story/:story_id')
    .get(Story.allReadings);

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
	.get(AuthoringUser.userFetch);

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

