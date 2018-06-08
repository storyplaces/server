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

let AuthoringSchema = require('../models/authoringSchema');
let CoreSchema = require('../models/coreschema');
let helpers = require('./helpers.js');
let converter = require('../conversion/SchemaConversion');
let Authorisation = require('../auth/Authorisation');
let Media = require('../models/Media.js');
let File = require('../utilities/File');

let AuthoringImage = require('./AuthoringImage');
let AuthoringAudio = require('./AuthoringAudio');

exports.create = create;
exports.index = index;
exports.fetch = fetch;
exports.update = update;
exports.publish = publish;
exports.preview = preview;
exports.downloadJson = downloadJson;

function create(req, res, next) {
    let requestBody = helpers.sanitizeAndValidateInboundIds(undefined, req.body);

    let authoringStory = new AuthoringSchema.AuthoringStory(requestBody);

    authoringStory.save(function (err) {
        if (err) {
            err.status = 400;
            err.clientMessage = "Unable To save authoring story";
            return next(err);
        }

        res.statusCode = 201;

        let toSend = helpers.sanitizeOutboundObject(authoringStory);

        res.json({
            message: 'Authoring Story created',
            object: toSend
        });
    });
}

function index(req, res, next) {
    let onlyOwnStories = Authorisation.doesNotHavePrivileges(['fetchAnyStory'], req.internal.privileges);
    let query = onlyOwnStories ? {"authorIds": req.internal.userId} : {};

    AuthoringSchema.AuthoringStory.find(query, function (err, authoringStories) {
        if (err) {
            return next(err);
        }

        let toSend = authoringStories.map(story => helpers.sanitizeOutboundObject(story));

        res.json(toSend);
    });
}

function fetch(req, res, next) {
    let storyId;

    try {
        storyId = helpers.validateId(req.params.story_id);
    } catch (error) {
        return next(error);
    }

    AuthoringSchema.AuthoringStory.findById(storyId, function (err, authoringStory) {
        if (err) {
            return next(err);
        }

        if (!authoringStory) {
            let error = new Error("Authoring Story id " + storyId + " not found");
            error.status = 404;
            error.clientMessage = "Authoring Story not found";
            return next(error);
        }

        if (Authorisation.doesNotHavePrivileges(['editAnyStory'], req.internal.privileges) && authoringStory.authorIds.indexOf(req.internal.userId) === -1) {
            let error = new Error("Unable to fetch a story not owned by this user");
            error.status = 403;
            error.clientMessage = "Insufficient privileges.";
            return next(error);
        }

        let toSend = helpers.sanitizeOutboundObject(authoringStory);

        res.json(toSend);
    });
}

function update(req, res, next) {
    let storyId;

    try {
        storyId = helpers.validateId(req.params.story_id);
    } catch (error) {
        return next(error);
    }

    let requestBody = helpers.sanitizeAndValidateInboundIds(storyId, req.body);

    AuthoringSchema.AuthoringStory.findById(storyId, function (err, authoringStory) {
        if (err) {
            return next(err);
        }

        if (!authoringStory) {
            let error = new Error("Authoring Story id " + storyId + " not found");
            error.status = 404;
            error.clientMessage = "Authoring Story not found";
            return next(error);
        }

        if (Authorisation.doesNotHavePrivileges(['editAnyStory'], req.internal.privileges) && authoringStory.authorIds.indexOf(req.internal.userId) === -1) {
            let error = new Error("Unable to update story for which they are not an owner");
            error.status = 403;
            error.clientMessage = "Insufficient privileges.";
            return next(error);
        }


        if (Authorisation.doesNotHavePrivileges(['editAnyStory'], req.internal.privileges)){
            // If not admin then don't change the owner
            requestBody.authorIds = authoringStory.authorIds;

        }

        let submittedModifiedDate = new Date(requestBody.modifiedDate);

        if (isNaN(submittedModifiedDate.getTime())) {
            let error = new Error("Invalid modified date passed");
            error.clientMessage = error.message;
            error.status = 400;
            return next(error);
        }

        if (submittedModifiedDate <= authoringStory.modifiedDate) {
            let error = new Error("The Authoring Story id " + storyId + " on the server is newer or the same age as the one submitted");
            error.clientMessage = "The Authoring Story on the server is newer or the same age as the one submitted";
            error.status = 409;
            return next(error);
        }


        AuthoringSchema.AuthoringStory.findByIdAndUpdate(storyId, requestBody, {
            new: true,
            runValidators: true
        }, function (err, authoringStory) {
            if (err) {
                return next(err);
            }

            if (!authoringStory) {
                let error = new Error("Unable to update story");
                error.status = 400;
                error.clientMessage = error.message;
                return next(err);
            }

            try {
                AuthoringImage.pruneImages(storyId, authoringStory.imageIds);
            } catch (error) {

            }

            try {
                AuthoringAudio.pruneAudio(storyId, authoringStory.audioIds);
            } catch (error) {

            }

            let toSend = helpers.sanitizeOutboundObject(authoringStory);

            res.json({
                message: 'Authoring Story updated',
                object: toSend
            });
        });
    });
}

function publish(req, res, next) {
    return handleStoryProcessing(req, res, next, "pending", "Your story has been submitted for approval");
}

function preview(req, res, next) {
    return handleStoryProcessing(req, res, next, "preview", "Story Preview Response");
}


function downloadJson(req, res, next) {
    // Convert the story, but don't save it, just return the JSON of the converted story in the response.
    let storyId;
    try {
        storyId = helpers.validateId(req.params.story_id);
    } catch (error) {
        return next(error);
    }

    AuthoringSchema.AuthoringStory.findById(storyId, function (err, authoringStory) {
        if (err) {
            return next(err);
        }

        if (!authoringStory) {
            let error = new Error("Authoring Story id " + storyId + " not found");
            error.status = 404;
            error.clientMessage = "Authoring Story not found";
            return next(error);
        }
        // Check user is authorised to download this story.
        let hasAnyPrivilege = Authorisation.hasPrivileges(['requestPublicationOfAnyStory'], req.internal.privileges);

        if (!hasAnyPrivilege && authoringStory.authorIds.indexOf(req.internal.userId) === -1) {
            let error = new Error("Unable to request conversion for a story not owned by this user");
            error.status = 403;
            error.clientMessage = "Insufficient privileges.";
            return next(error);
        }

        let readingStory;

        AuthoringSchema.AuthoringUser.findById(authoringStory.authorIds, function (err, authoringUser) {
            if (err) {
                let error = new Error("Unable to convert story " + storyId);
                error.status = 500;
                error.clientMessage = "Unable to convert story";
                return next(error);
            }

            try {
                readingStory = converter.convert(authoringStory, "preview", authoringUser.name);
            } catch (e) {
                console.log(e);
                let error = new Error("Unable to convert story " + storyId);
                error.status = 500;
                error.clientMessage = "Unable to convert story";
                return next(error);
            }

            let story = new CoreSchema.Story(readingStory);

            res.statusCode = 200;
            res.header("Content-Disposition", "attachment; filename=download.json");
            res.json(story);
            return;
        });
    });
}

function handleStoryProcessing(req, res, next, readingState, responseMessage) {
    let storyId;

    try {
        storyId = helpers.validateId(req.params.story_id);
    } catch (error) {
        return next(error);
    }

    AuthoringSchema.AuthoringStory.findById(storyId, function (err, authoringStory) {
        if (err) {
            return next(err);
        }

        if (!authoringStory) {
            let error = new Error("Authoring Story id " + storyId + " not found");
            error.status = 404;
            error.clientMessage = "Authoring Story not found";
            return next(error);
        }

        let hasAnyPrivilege;

        if (readingState === "preview") {
            hasAnyPrivilege = Authorisation.hasPrivileges(['requestPreviewOfAnyStory'], req.internal.privileges);
        } else {
            hasAnyPrivilege = Authorisation.hasPrivileges(['requestPublicationOfAnyStory'], req.internal.privileges);
        }

        if (!hasAnyPrivilege && authoringStory.authorIds.indexOf(req.internal.userId) === -1) {
            let error = new Error("Unable to request conversion for a story not owned by this user");
            error.status = 403;
            error.clientMessage = "Insufficient privileges.";
            return next(error);
        }

        let readingStory;

        AuthoringSchema.AuthoringUser.findById(authoringStory.authorIds, function (err, authoringUser) {
            if (err) {
                let error = new Error("Unable to convert story " + storyId);
                error.status = 500;
                error.clientMessage = "Unable to convert story";
                return next(error);
            }

            try {
                readingStory = converter.convert(authoringStory, readingState, authoringUser.name);
            } catch (e) {
                console.log(e);
                let error = new Error("Unable to convert story " + storyId);
                error.status = 500;
                error.clientMessage = "Unable to convert story";
                return next(error);
            }

            let story = new CoreSchema.Story(readingStory);
            story.save(function (err, savedStory) {
                if (err) {
                    console.log(err);
                    let error = new Error("Unable to convert story " + storyId);
                    error.status = 500;
                    error.clientMessage = "Unable to convert story";
                    return next(error);
                }

                // Copy media to reading story location

                let success = true;
                savedStory.cachedMediaIds.forEach(function (mediaId) {
                    var destPath = Media.getDestMediaFolderPathFromId(savedStory.id);
                    var sourcePath = File.authoringMediaFolder() + "/" + authoringStory.id + '/';

                    if (!tryFileCopy(mediaId, destPath, sourcePath)) {
                        success = false;
                        let error = new Error("Unable to find all media for story " + storyId + ". Media with id " + mediaId + " was missing.");
                        error.status = 500;
                        error.clientMessage = "Unable to convert all media for story.";
                        return next(error);
                    }
                });

                if (success) {
                    res.statusCode = 200;
                    res.json({"message": responseMessage, "id": savedStory.id})
                }
            });
        });

    });
}

function tryFileCopy(mediaId, destPath, sourcePath) {
    let count = 0;
    ['.jpeg', '.png', '.json', '.mp3', '.mp4'].forEach(function (extension) {
        let fileName = mediaId.concat(extension);
        if (File.copyFile(fileName, sourcePath, destPath)) {
            count++;
        }
    });
    // Check that at least two files have been copied. There should always be one image and one base64 encoding.
    return count >= 2;
}