"use strict";

var secrets = require('../config/secrets');
var request = require('request');

var AuthoringSchema = require('../models/authoringSchema');

var jwtAuthentication = require('../auth/JwtAuthentication');

exports.googleLogin = googleLogin;
exports.logout = logout;
exports.disconnect = disconnect;
exports.getPublicKey = getPublicKey;

function googleLogin(req, res, next) {
    var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
    var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
    var params = {
        code: req.body.code,
        client_id: req.body.clientId,
        client_secret: secrets.auth.socialProviders.google.secretToken,
        redirect_uri: req.body.redirectUri,
        grant_type: 'authorization_code'
    };

    // Step 1. Exchange authorization code for access token.
    request.post(accessTokenUrl, {json: true, form: params}, function (err, response, token) {
        var accessToken = token.access_token;
        var headers = {Authorization: 'Bearer ' + accessToken};

        // Step 2. Retrieve profile information about the current user.
        request.get({url: peopleApiUrl, headers: headers, json: true}, function (err, response, profile) {
            if (profile.error) {
                return res.status(500).send({message: profile.error.message});
            }

            if (!req.header('Authorization')) {
                findOrCreateUserFromProfile(profile, function (user) {
                    if (!user.enabled) {
                        return res.status(401).send({message: 'User disabled'});
                    }

                    var token = jwtAuthentication.createJWTFromUser(user);
                    res.send({token: token});
                });
            } else {
                // If it is wanted to have multiple social providers or social + local and to allow accounts to be linked
                // then check https://github.com/sahat/satellizer/blob/master/examples/server/node/server.js for how to do it
                return res.status(500).send({message: 'User already logged in'});
            }
        });
    });
}


function logout(req, res, next) {
    // We likely just have to do nothing here
}

function disconnect(req, res, next) {
    //TODO: Check if we need to do anything to disconnect an account
}

function findOrCreateUserFromProfile(profile, callback) {
    AuthoringSchema.AuthoringUser.findOne({googleID: profile.sub}, function (err, existingUser) {
        if (existingUser) {
            return updateUserFromProfile(existingUser, profile, callback);
        }

        createUserFromProfile(profile, callback);
    });
}

function createUserFromProfile(profile, callback) {
    var user = new AuthoringSchema.AuthoringUser();
    user.bio = "";
    user.roles = ["author"];
    user.enabled = true;
    user.googleID = profile.sub;
    user.name = profile.name;
    updateUserFromProfile(user, profile, callback);
}

function updateUserFromProfile(user, profile, callback) {
    user.email = user.email || profile.email;
    user.save(function () {
        callback(user);
    });
}

function getPublicKey(req, res, next) {
    return res.send({publicKey: jwtAuthentication.getPublicJWT()});
}

