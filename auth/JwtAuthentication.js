exports.getPublicJWT = getPublicJWT;
exports.createJWTFromUser = createJWTFromUser;
exports.getPayloadAndValidateJWT = getPayloadAndValidateJWT;

exports.createJwtFromPayload = createJwtFromPayload;

var fs = require('fs');

var moment = require('moment');
var jwt = require('jwt-simple');
var Authorisation = require('./Authorisation');

var secrets = require('../config/secrets.json');
var settings = require('../config/settings.json');

var jwtPrivate = fs.readFileSync(secrets.auth.jwt.private);
var jwtPublic = fs.readFileSync(secrets.auth.jwt.public);

function createJWTFromUser(user) {
    var payload = {
        sub: user._id,
        iat: moment().unix(),
        exp: moment().add(settings.jwt.ttlDays, 'days').unix()
    };

    return createJwtFromPayload(payload);
}

function getPublicJWT() {
    return jwtPublic.toString();
}

function getPayloadAndValidateJWT(token) {
    var payload = null;

    try {
        payload = decodePayloadFromToken(token);
    } catch (err) {
        throw new Error(err.message);
    }

    if (payload.exp <= moment().unix()) {
        throw new Error("Token has expired");
    }

    return payload;
}

function decodePayloadFromToken(token) {
    return jwt.decode(token, jwtPublic);
}

function createJwtFromPayload(payload) {
    return jwt.encode(payload, jwtPrivate, 'RS256');
}