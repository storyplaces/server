/**
 * Created by kep1u13 on 21/04/2016.
 */

"use strict";

var settings = require('../config/settings.json');
var Logger = require('../utilities/Logger.js');

var fs = require('fs');

var fileOptions = {
    root: rootFolder(),
    dotfiles: 'deny'
};


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

function fetch(req, res, next) {
    var mediaPath = buildFilePath(req);

    if (!mediaPath) {
        var err = new Error("Media file not found");
        err.clientMessage = "Media not found";
        err.status = 404;
        return next(err);
    }

    res.sendfile(mediaPath, fileOptions, function (err) {
        if (err) {
            err.status = 404;
            return next(err);
        } else {
            Logger.log("Served media " + mediaPath);
        }
    });
}

function buildFilePath(req) {
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

        if (fileExistsAndIsReadable(file)) {
            return file;
        }
    }

    return undefined;
}

function fileExistsAndIsReadable(fileName) {
    var file = rootFolder() + "/" + fileName;

    try {
        fs.accessSync(file, fs.R_OK);
    } catch(e) {
        return false;
    }

    return true;
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

exports.fetch = fetch;
