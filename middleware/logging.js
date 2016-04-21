/**
 * Created by kep1u13 on 21/04/2016.
 */

"use strict";

exports.logRequest = logRequest;

function logRequest(req, res, next) {
    // do logging
    console.log('Request Made ' + req.method + ' ' + req.path);
    next(); // make sure we go to the next routes and don't stop here
}