/**
 * Created by kep1u13 on 21/04/2016.
 */

"use strict";

module.exports = logRequest;

var Logger = require('../utilities/Logger.js')

function logRequest(req, res, next) {
    Logger.log('Request made: ' + req.method + ' ' + req.path);
    next();
}