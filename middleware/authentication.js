/**
 * Created by kep1u13 on 21/04/2016.
 */

"use strict";

var secrets = require('../config/secrets');

exports.tokenAuth = tokenAuth;

function tokenAuth(req, res, next) {

    if (req.header(secrets.auth.token) === secrets.auth.value) {
        console.log('Token OK');
        next();
        return;
    }

    console.log('Bad Token');
    res.status(403).json({'Error' : 'Permission denied'});
}