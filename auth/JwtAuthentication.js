exports.getPublicJWT = getPublicJWT;
exports.createJWTFromUser = createJWTFromUser;
exports.getPayloadAndValidateJWT = getPayloadAndValidateJWT;

exports.createJwtFromPayload = createJwtFromPayload;

var fs = require('fs');

var moment = require('moment');
var jwtSimple = require('jwt-simple');
var Authorisation = require('./Authorisation');

var secrets = require('../config/secrets.json');
var settings = require('../config/settings.json');

var jwtPrivateKey = fs.readFileSync(secrets.auth.jwt.private);
var jwtPublicKey = fs.readFileSync(secrets.auth.jwt.public);

const jwtEncoding = 'RS256';

function createJWTFromUser(user) {
    var payload = {
        sub: user._id,
        iat: moment().unix(),
        exp: moment().add(settings.jwt.ttlDays, 'days').unix(),
        displayName: user.name,
        bio: user.bio
    };

    return createJwtFromPayload(payload);
}

function getPublicJWT() {
    return jwtPublicKey.toString();
}

function getPayloadAndValidateJWT(token) {
    var payload = null;

    try {
        payload = decodePayloadFromJwt(token);
    } catch (err) {
        throw new Error(err.message);
    }

    if (payload.exp <= moment().unix()) {
        throw new Error("Token has expired");
    }

    return payload;
}

function decodePayloadFromJwt(jwt) {
    return jwtSimple.decode(jwt, jwtPublicKey, false, jwtEncoding);
}

function createJwtFromPayload(payload) {
    return jwtSimple.encode(payload, jwtPrivateKey, jwtEncoding);
}