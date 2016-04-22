/**
 * Created by kep1u13 on 21/04/2016.
 */

"use strict";

var secrets = require('../config/secrets');

module.exports = tokenAuth;

function tokenAuth(req, res, next) {

    if (req.header(secrets.auth.token) === secrets.auth.value) {
        return next();
    }

    var error = Error();
    error.status = 403;
    error.stack = "Bad token provided during: " + req.method + ' ' + req.path;
    error.clientMessage = "Permission Denied";

    next(error);
}