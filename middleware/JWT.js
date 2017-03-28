"use strict";

// Taken from https://github.com/sahat/satellizer/blob/master/examples/server/node/server.js

module.exports = validateJWT;

var JWT = require('../auth/JWT');

function validateJWT(req, res, next) {
    if (!req.header('Authorization')) {
        return res.status(401).send({message: 'Please make sure your request has an Authorization header'});
    }

    var token = req.header('Authorization').split(' ')[1];

    try {
        var payload = JWT.getPayloadAndValidateJWT(token);
    } catch (err) {
        return res.status(401).send({message: err.message});
    }

    req.user = payload.sub;
    req.privileges = payload.privileges;
    next();
}

