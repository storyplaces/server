/**
 * Created by kep1u13 on 22/04/2016.
 */

"use strict";

module.exports = logErrorToConsole;

var Logger = require('../utilities/Logger.js');

function logErrorToConsole(err, req, res, next) {
    Logger.error(err.clientMessage);
    Logger.error(err.stack);
    next(err);
}