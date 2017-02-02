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

var CoreSchema = require('../models/coreschema');
var helpers = require('./helpers.js');

exports.create = create;
exports.index = index;
exports.fetch = fetch;
exports.destroy = destroy;
exports.allReadings = allReadings;
exports.readingsForUser = allReadingsForUser;
exports.update = update;

function create(req, res, next) {

    var story = new CoreSchema.Story(req.body);

    story.save(function (err) {
        if (err) {
            err.status = 400;
            err.clientMessage = "Unable To save story";
            return next(err);
        }

        res.json({message: 'Story created!'});
    });
}

function index(req, res, next) {
    CoreSchema.Story.find(function (err, stories) {
        if (err) {
            return next(err);
        }

        res.json(stories);
    });
}

function fetch(req, res, next) {
    try {
        var storyId = helpers.validateId(req.params.story_id);
    } catch (error) {
        return next(error);
    }

    CoreSchema.Story.findById(storyId, function (err, story) {
        if (err) {
            return next(err);
        }

        if (!story) {
            var error = new Error();
            error.status = 404;
            error.clientMessage = error.message = "Story not found";
            return next(error);
        }

        res.json(story);
    });
}

function destroy(req, res, next) {
    try {
        var storyId = helpers.validateId(req.params.story_id);
    } catch (error) {
        return next(error);
    }

    CoreSchema.Story.remove(
        {_id: storyId},
        function (err, story) {
            if (err) {
                return next(err);
            }

            if (!story) {
                var error = new Error();
                error.status = 400;
                error.clientMessage = error.message = "Unable to delete story";
                return next(error);
            }

            res.json({message: 'Successfully deleted'});
        });
}

function allReadings(req, res, next) {
    try {
        var storyId = helpers.validateId(req.params.story_id);
    } catch (error) {
        return next(error);
    }

    CoreSchema.Reading.find({"storyId": storyId}, function (err, readings) {
        if (err) {
            return next(err);
        }

        res.json(readings);
    });
}

function allReadingsForUser(req, res, next) {
    try {
        var storyId = helpers.validateId(req.params.story_id);
        var userId = helpers.validateId(req.params.user_id);
    } catch (error) {
        return next(error);
    }

    CoreSchema.Reading.find({"storyId": storyId, "userId": userId}, function (err, readings) {
        if (err) {
            return next(err);
        }

        res.json(readings);
    });
}

function update(req, res, next) {
    try {
        var storyId = helpers.validateId(req.params.story_id);
    } catch (error) {
        return next(error);
    }

    CoreSchema.Story.findByIdAndUpdate(storyId, req.body, function (err, story) {
        if (err) {
            return next(err);
        }

        if (!story) {
            var error = new Error();
            error.status = 400;
            error.clientMessage = error.message = "Unable To update story";
            return next(error);
        }

        res.json(story);
    });
}