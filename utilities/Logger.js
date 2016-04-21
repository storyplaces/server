/**
 * Created by kep1u13 on 21/04/2016.
 */

"use strict";

exports.log = log;
exports.error = error;

function log(message) {
    if (message) {
        console.log("%s %s", formattedDate(), message);
    }
}

function error(message) {
    if (message) {
        console.error("%s %s", formattedDate(), message);
    }
}

function formattedDate() {
    return new Date().toISOString();
}

