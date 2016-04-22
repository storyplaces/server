/**
 * Created by kep1u13 on 21/04/2016.
 */

"use strict";

module.exports = replyWithError;

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