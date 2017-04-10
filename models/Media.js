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

var settings = require('../config/settings.json');
var Logger = require('../utilities/Logger.js');
var File = require('../utilities/File.js');

var fs = require('fs');


function fullPath(storyId) {
    return rootFolder() + "/" + storyId;
}

function getFileNameFromRequest(req) {
    var base = buildBaseOfFilePath(req);

    if (!base) {
        return undefined;
    }

    if (req.accepts("image")) {
        return buildMediaFilePath(base);
    }

    return buildJsonFilePath(base);
}

function buildMediaFilePath(base) {
    return findFileWithPossibleExtension(base, ['jpg', 'jpeg', 'png', 'gif', 'mp3']);
}

function buildJsonFilePath(base) {
    return findFileWithPossibleExtension(base, ['json', 'txt']);
}

function findFileWithPossibleExtension(base, extensions) {
    var length = extensions.length;
    var i;
    var file;

    for (i = 0; i < length; i++) {
        file = base + "." + extensions[i];

        if (File.fileExistsAndIsReadable(fullPath(file))) {
            return file;
        }
    }

    return undefined;
}


function buildBaseOfFilePath(req) {
    var storyId = validateId(req.params.story_id);
    var mediaId = validateId(req.params.media_id);

    if (storyId && mediaId) {
        return storyId + "/" + mediaId;
    }

    return undefined;
}

function validateId(id) {
    var string = String(id);

    // Ensure we have a hex string
    if (string.match(/^[a-f0-9]+$/i)) {
        return string;
    }

    return undefined;
}

/**
 * Work out the root of where we look for media based upon the settings.
 * If mediaPath is set as a absolute path then we will look there
 * otherwise we will use a relative path from the root of the application
 *
 * @returns {string}
 */
function rootFolder() {
    if (settings.server.mediaPath[0] === '/') {
        return settings.server.mediaPath;
    }

    return fs.realpathSync(__dirname + '/../' + settings.server.mediaPath);
}

function getDestMediaFolderPathFromId(storyId){
    var path = rootFolder();
    if (storyId) {
        path = path.concat('/', storyId, '/');
    }
    return path;
}


exports.getDestMediaFolderPathFromId = getDestMediaFolderPathFromId;
exports.getFileNameFromRequest = getFileNameFromRequest;
exports.rootFolder = rootFolder;
exports.validateId = validateId;
exports.fullPath = fullPath;
