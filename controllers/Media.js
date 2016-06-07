/**
 * Created by kep1u13 on 21/04/2016.
 */

"use strict";

var media = require('../models/Media.js');
var Logger = require('../utilities/Logger.js');

function fetch(req, res, next) {

    // Setup how we serve the files and set teh max age to one day.

    var fileOptions = {
        root: media.rootFolder(),
        dotfiles: 'deny',
        maxAge: 60*24*1000
    };

    var mediaPath = media.getFileNameFromRequest(req);

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



exports.fetch = fetch;
