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

let CoreSchema = require('../models/coreschema');
let helpers = require('./helpers.js');
let fse = require('fs-extra');
let Media = require('../models/Media.js');
let File = require('../utilities/File');

exports.create = create;
exports.index = index;
exports.adminindex = adminindex;
exports.fetch = fetch;
exports.allReadings = allReadings;
exports.readingsForUser = allReadingsForUser;
exports.approve = approve;
exports.remove = remove;
exports.createPreview = createPreview;

function create(req, res, next) {

    delete req.body.id;
    delete req.body._id;

    let requestBody = helpers.sanitizeAndValidateInboundIds(undefined, req.body);

    var story = new CoreSchema.Story(requestBody);
    story.publishState = "pending";

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
    CoreSchema.Story.find({'publishState': 'published'}, function (err, stories) {
        if (err) {
            return next(err);
        }

        let toSend = stories.map(story => sanitizeOutboundStory(story));

        res.json(toSend);
    });
}

function adminindex(req, res, next) {
    CoreSchema.Story.find({'publishState': {'$in': ['published', 'pending']}}, function (err, stories) {
        if (err) {
            return next(err);
        }

        let toSend = stories.map(story => sanitizeOutboundStory(story));

        res.json(toSend);
    });
}

function approve(req, res, next) {
    try {
        var storyId = helpers.validateId(req.params.story_id);
    } catch (error) {
        return next(error);
    }

    CoreSchema.Story.findByIdAndUpdate(storyId, {$set: {publishState: req.body.publishState}}, {
        new: true,
        runValidators: true
    }, function (err, story) {
        if (err) {
            return next(err);
        }

        if (!story) {
            var error = new Error();
            error.status = 400;
            error.clientMessage = error.message = "Unable To update story";
            return next(error);
        }

        let toSend = sanitizeOutboundStory(story);

        res.json(toSend);
    });
}

function remove(req, res, next) {
    try {
        var storyId = helpers.validateId(req.params.story_id);
    } catch (error) {
        return next(error);
    }

    CoreSchema.Story.findByIdAndRemove(storyId, function (err, story) {
        if (err) {
            return next(err);
        }

        if (!story) {
            var error = new Error();
            error.status = 400;
            error.clientMessage = error.message = "Unable to delete story";
            return next(error);
        }

        res.json({"success": true, "id": storyId});
    });
}

function fetch(req, res, next) {
    try {
        var storyId = helpers.validateId(req.params.story_id);
    } catch (error) {
        return next(error);
    }

    CoreSchema.Story.findOne({
        'publishState': {'$in': ['published', 'preview']},
        '_id': storyId
    }, function (err, story) {
        if (err) {
            return next(err);
        }

        if (!story) {
            var error = new Error();
            error.status = 404;
            error.clientMessage = error.message = "Story not found";
            return next(error);
        }

        // Preview links are supposed to be single use only, so after fetching it once remove it
        if (story.publishState == 'preview') {
            story.remove();
        }

        let toSend = sanitizeOutboundStory(story);

        res.json(toSend);
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

        let toSend = readings.map(reading => helpers.sanitizeOutboundObject(reading));

        res.json(toSend);
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

        let toSend = readings.map(reading => helpers.sanitizeOutboundObject(reading));

        res.json(toSend);
    });
}

function createPreview(req, res, next) {
    try {
        var storyId = helpers.validateId(req.params.story_id);
    } catch (error) {
        return next(error);
    }

    CoreSchema.Story.findById(storyId, function (err, story) {
        if (err) {
            return next(err);
        }

        var error = new Error();

        if (!story) {
            error.message = "Story id " + storyId + " not found";
            error.status = 404;
            error.clientMessage = "Story not found";
            return next(error);

        }
        var storyToPreview = story.toJSON();
        storyToPreview.publishState = "preview";
        delete storyToPreview._id;
        delete storyToPreview.id;
        var previewStory = new CoreSchema.Story(storyToPreview);

        previewStory.save(function (err, savedStory) {
            if (err) {
                error.message = "Unable to create preview story " + storyId;
                error.status = 500;
                error.clientMessage = "Unable to create preview story";
                return next(error);
            }

            // Copy media files
            let destPath = Media.getDestMediaFolderPathFromId(savedStory.id);
            let sourcePath = Media.getDestMediaFolderPathFromId(storyId);

            if (File.isDirectoryOK(sourcePath)) {
                fse.copySync(sourcePath, destPath);
            }

            res.statusCode = 200;
            res.json({"message": "Preview Created", "id": savedStory.id})
        });
    });

}

function sanitizeOutboundStory(story) {
    let toSend = helpers.sanitizeOutboundObject(story);
    toSend.locations = toSend.locations.map(location => helpers.sanitizeOutboundJson(location));
    toSend.functions = toSend.functions.map(func => helpers.sanitizeOutboundJson(func));
    toSend.pages = toSend.pages.map(page => helpers.sanitizeOutboundJson(page));

    return toSend;

}