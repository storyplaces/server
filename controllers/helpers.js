/**
 * Created by kep1u13 on 01/02/2017.
 */

"use strict";

exports.validateId = validateId;
exports.authoringMediaFolder = authoringMediaFolder;

let fs = require('fs');
let settings = require('../config/settings.json');

function validateId(passedId) {
    var id = passedId.replace(/[^0-9A-F]/gi, '');

    if (id != passedId) {
        throw new Error("Bad characters passed in the id");
    }

    return id;
}


function authoringMediaFolder() {
    if (settings.server.mediaPath[0] === '/') {
        return settings.server.authoringMediaPath;
    }

    return fs.realpathSync(__dirname + '/../' + settings.server.authoringMediaPath);
}