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
let helpers = require('./helpers.js');

let Authorisation = require('../auth/Authorisation');
let fs = require('fs');

let Logger = require('../utilities/Logger.js');
let File = require('../utilities/File.js');

let gm = require('gm');

exports.create = create;
exports.fetch = fetch;

function create(req, res, next) {

    if (!req.file) {
        let error = new Error("Unable to create audio file");
        error.status = 400;
        error.clientMessage = error.message;
        return next(error);
    }

    let storyId = helpers.validateId(req.params.story_id);
    let canUploadAnyAudio = Authorisation.hasPrivileges(['uploadAnyAudio'], req.internal.privileges);

    checkStoryOwnership(storyId, canUploadAnyAudio, req.internal.userId, (ownershipError) => {

        if (ownershipError) {
            return next(ownershipError);
        }

        let filePath = req.file.path;
        let filename = req.file.filename;
        let mimeType = req.file.mimetype;

        if (!req.file || !filename || !filePath || !mimeType) {
            let error = new Error("Bad audio file uploaded");
            error.response = 400;
            error.clientMessage = "Bad audio file";
            return next(error);
        }

        let id = filename.substr(0, filename.lastIndexOf('.'));

        let authoringImage = new AuthoringSchema.AuthoringImage({
            id: id,
            storyId: storyId,
            mimeType: mimeType
        });

        authoringImage.save(err => {
            if (err) {
                err.status = 400;
                err.message = "Unable to create image";
                return next(err);
            }

            createJSONFile(filePath, mimeType);

            Logger.log(`Audio file ${id} uploaded for story ${storyId}`);

            res.json({
                message: "Audio File created",
                audioId: id
            });
        });

    });
}

function createJSONFile(filePath, mimetype) {
    let jsonData = {
        "contentType": mimetype,
        "content": File.base64EncodeFile(filePath)
    };

    let basePath = filePath.substr(0, filePath.lastIndexOf('.'));
    let jsonPath = basePath + '.json';

    File.createFile(jsonPath, JSON.stringify(jsonData));
}


function makePath(storyId) {
    return File.authoringMediaFolder() + '/' + storyId + '/';
}

function processFetch(req, res, next) {
    let storyId;
    let audioId;

    try {
        storyId = helpers.validateId(req.params.story_id);
        audioId = helpers.validateId(req.params.audio_id);
    } catch (error) {
        return next(error);
    }

    let canFetchAnyAudio = Authorisation.hasPrivileges(['getAnyAudio'], req.internal.privileges);

    checkStoryOwnership(storyId, canFetchAnyAudio, req.internal.userId, (ownershipError) => {

        if (ownershipError) {
            return next(ownershipError);
        }

        let fileOptions = {
            root: makePath(storyId),
            dotfiles: 'deny',
            maxAge: 60 * 24 * 1000
        };

        AuthoringSchema.AuthoringAudio.find({id: audioId, storyId: storyId}, (err, authoringAudio) => {
            let filename;

            if (err) {
                return next(err);
            }

            if (!authoringAudio) {
                let error = new Error("Authoring Audio id " + audioId + " for story " + storyId + " not found");
                error.status = 404;
                error.clientMessage = "Audio File not found";
                return next(error);
            }

            res.sendFile(filename, fileOptions, err => {
                if (err) {
                    err.status = 404;
                    return next(err);
                }

                Logger.log("Served media " + filename);
            });
        });

    });
}

function fetch(req, res, next) {
    processFetch(req, res, next, false);
}

function checkStoryOwnership(storyId, canUploadAnyAudio, userId, callback) {

    if (canUploadAnyAudio) {
        return callback(undefined);
    }

    AuthoringSchema.AuthoringStory.findById(storyId, (err, authoringStory) => {
        if (err) {
            return callback(err);
        }

        if (!authoringStory) {
            let error = new Error("No such story " + storyId);
            error.status = 404;
            error.clientMessage = "Not found";
            return callback(error)
        }

        if (authoringStory.authorIds.indexOf(userId) === -1) {
            let error = new Error("User is not an author on this story");
            error.status = 401;
            error.clientMessage = "Permission denied";
            return callback(error)
        }

        callback(undefined);
    });
}

function pruneAudio(storyId, audioIds) {

    AuthoringSchema.AuthoringAudio.find({storyId: storyId}, (err, authoringAudioFiles) => {
        if (err) {
            throw err;
        }

        authoringAudioFiles.forEach(audioFile => {
            if (audioIds.indexOf(audioFile.id) === -1) {
                Logger.log(`Cleaning up audio file ${audioFile.id}`);
                deleteAudio(storyId, audioFile.id, audioFile.mimeType);
                audioFile.remove();
            }
        });

    });
}

function deleteAudio(storyId, audioId, mimeType) {
    let base = makePath(storyId) + '/' + audioId;
    let extension = mimeType.split('/')[1];

    try {
        fs.unlinkSync(`${base}.${extension}`);
        fs.unlinkSync(`${base}.json`);
    } catch (error) {
        Logger.error(`Unable to delete audio files for audio id ${audioId} at base path ${base}`);
    }
}