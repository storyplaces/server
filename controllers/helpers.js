/**
 * Created by kep1u13 on 01/02/2017.
 */

"use strict";

exports.validateId = validateId;

let fs = require('fs');

function validateId(passedId) {
    var id = passedId.replace(/[^0-9A-F]/gi, '');

    if (id != passedId) {
        throw new Error("Bad characters passed in the id");
    }

    return id;
}

