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

var AuthoringSchema = require('../models/authoringSchema');
var helpers = require('./helpers.js');

exports.create = create;
exports.index = index;
exports.fetch = fetch;
exports.update = update;
exports.userFetch = userFetch;
exports.publish = publish;

function create(req, res, next) {

    var authoringStory = new AuthoringSchema.AuthoringStory(req.body);

    authoringStory.save(function (err) {
        if (err) {
            err.status = 400;
            err.clientMessage = "Unable To save authoring story";
            return next(err);
        }

        res.statusCode = 201;
        res.json({
            message: 'Authoring Story created',
            object: authoringStory
        });
    });
}

function index(req, res, next) {
    AuthoringSchema.AuthoringStory.find(function (err, authoringStories) {
        if (err) {
            return next(err);
        }

        res.json(authoringStories);
    });
}

function fetch(req, res, next) {
    try {
        var storyId = helpers.validateId(req.params.story_id);
    } catch (error) {
        return next(error);
    }

    AuthoringSchema.AuthoringStory.findById(storyId, function (err, authoringStory) {
        if (err) {
            return next(err);
        }

        var error = new Error();

        if (!authoringStory) {
            error.message = "Authoring Story id " + storyId + " not found";
            error.status = 404;
            error.clientMessage = "Authoring Story not found";
            return next(error);
        }

        res.json(authoringStory);
    });
}

function update(req, res, next) {
    try {
        var storyId = helpers.validateId(req.params.story_id);
    } catch (error) {
        return next(error);
    }


    AuthoringSchema.AuthoringStory.findById(storyId, function (err, authoringStory) {
        if (err) {
            return next(err);
        }

        var error = new Error();

        if (!authoringStory) {
            error.message = "Authoring Story id " + storyId + " not found";
            error.status = 404;
            error.clientMessage = "Authoring Story not found";
            return next(error);
        }

        var submittedModifiedDate = new Date(req.body.modifiedDate);

        if (isNaN(submittedModifiedDate.getTime())) {
            error.clientMessage = error.message = "Invalid modified date passed";
            error.status = 400;
            return next(error);
        }

        if (submittedModifiedDate <= authoringStory.modifiedDate) {
            error.message = "The Authoring Story id " + storyId + " on the server is newer or the same age as the one submitted";
            error.clientMessage = "The Authoring Story on the server is newer or the same age as the one submitted";
            error.status = 409;
            return next(error);
        }

        AuthoringSchema.AuthoringStory.findByIdAndUpdate(storyId, req.body, function (err, authoringStory) {
            if (err) {
                return next(err);
            }

            if (!authoringStory) {
                error.status = 400;
                error.clientMessage = error.message = "Unable to update story";
                return next(err);
            }

            res.json({
                message: 'Authoring Story updated',
                object: authoringStory
            });
        });
    });


}

function userFetch(req, res, next) {
    AuthoringSchema.AuthoringStory.find({"authorIds": req.params.user_id}, function (err, authoringStories) {
        if (err) {
            return next(err);
        }

        res.json(authoringStories);
    });

}

function publish(req, res, next) {
    try {
        var storyId = helpers.validateId(req.params.story_id);
    } catch (error) {
        return next(error);
    }

    AuthoringSchema.AuthoringStory.findById(storyId, function (err, authoringStory) {
        if (err) {
            return next(err);
        }

        var error = new Error();

        if (!authoringStory) {
            error.message = "Authoring Story id " + storyId + " not found";
            error.status = 404;
            error.clientMessage = "Authoring Story not found";
            return next(error);
        }

        // Create basic story
        var readingStory = {};
        readingStory.name = authoringStory.title;
        readingStory.description = authoringStory.description;
        readingStory.audience = authoringStory.audience;
        readingStory.tags = authoringStory.tags;
        readingStory.publishState = "pending";
        readingStory.locations = [];
        readingStory.conditions = [];

        // Create Locations

        // Create variables, functions, conditions
        var conditions = [];
        var functions = [];

        // Conditions and variables for chapters
        authoringStory.chapters.forEach(function (chapter){
            var newCondition = {};
            newCondition.id = "chapter" + chapter.id;
            newCondition.name = "chapter" + chapter.id;

        });

        // Create and add pages
        var pages = [];
        authoringStory.pages.forEach(function (page) {
            var locationId = findAndCopyLocation(page.locationId, authoringStory, readingStory);
            var locationConditionId = makeLocationConditionId(locationId);

            var newPage = {};
            newPage.id = page.id;
            newPage.content = page.content;
            newPage.name = page.name;
            newPage.pageTransition = page.finishesStory ? "finish" : "next";
            newPage.hint = {direction: page.pageHint, locations: locationId ? [locationId] : []};
            pages.push(newPage);
        });

        // Add conditions for chapters

        readingStory.pages = pages;
        readingStory.chapters = chapters;

        readingStory.locations.forEach(function (location) {
            createLocationCondition(location, readingStory);
        });

        res.statusCode = 400;
        res.json(readingStory);
    });

    function createLocationCondition(location, readingStory) {
        readingStory.conditions.push({
            id: makeLocationConditionId(location.id),
            location: location.id,
            bool: "true",
            type: "location"
        });
    }

    function findAndCopyLocation(locationId, authoringStory, readingStory) {
        if (!locationId) {
            return undefined;
        }

        var location = authoringStory.locations.filter(function (location) {
            return location.id == locationId
        }).pop();

        switch (location.type) {
            case "circle":
                return copyCircleLocation(location, readingStory);
            default:
                return undefined;
        }
    }

    function copyCircleLocation(location, readingStory) {
        var existingLocation = readingStory.locations.filter(function (readingLocation) {
            if (readingLocation.type != "circle") {
                return undefined;
            }

            var latMatches = readingLocation.lat == location.lat;
            var lonMatches = readingLocation.lon == location.long;
            var radiusMatches = readingLocation.radius == location.radius;
            return latMatches && lonMatches && radiusMatches;
        });

        if (existingLocation.length != 0) {
            return existingLocation.pop().id;
        }

        readingStory.locations.push({
            id: location.id,
            lat: location.lat,
            lon: location.long,
            radius: location.radius,
            type: "circle"
        });

        return location.id;
    }

    function makeLocationConditionId(locationId) {
        if (!locationId) {
            return undefined;
        }

        return "location-" + locationId;
    }
}