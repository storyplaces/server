/**
 * Created by kep1u13 on 07/06/2016.
 */

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
        return buildImageFilePath(base);
    }

    return buildJsonFilePath(base);
}

function buildImageFilePath(base) {
    return findFileWithPossibleExtension(base, ['jpg', 'jpeg', 'png', 'gif']);
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



exports.getFileNameFromRequest = getFileNameFromRequest;
exports.rootFolder = rootFolder;
exports.validateId = validateId;
exports.fullPath = fullPath;
