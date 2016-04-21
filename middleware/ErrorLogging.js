/**
 * Created by kep1u13 on 21/04/2016.
 */

"use strict";

exports.replyWithErrors = replyWithError;
exports.logToConsole = logErrorToConsole;

var Logger = require('../utilities/Logger.js')

function logErrorToConsole(err, req, res, next) {
    Logger.error(err.clientMessage);
    Logger.error(err.stack);
    next(err);
}

function replyWithError(err, req, res, next) {
    var status = 500;
    var message = "Internal Server Error";

    if (err.status) {
        status = err.status;
    }

    if (err.clientMessage) {
        message = err.clientMessage;
    }

    res.status(status).send({error: message});
}