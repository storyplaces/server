"use strict";

var secrets = require('../config/secrets');
var request = require('request');

var AuthoringSchema = require('../models/authoringSchema');

var fs = require('fs');
var jwtPublic = fs.readFileSync(secrets.auth.jwt.public);
var JWT = require('../auth/JWT');

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

            // Step 3a. Link user accounts.
            if (req.header('Authorization')) {
                AuthoringSchema.AuthoringUser.findOne({googleID: profile.sub}, function (err, existingUser) {
                    if (existingUser) {
                        return res.status(409).send({message: 'There is already a Google account that belongs to you'});
                    }

                    var token = req.header('Authorization').split(' ')[1];

                    try {
                        var payload = JWT.getPayloadAndValidateJWT(token);
                    } catch (err) {
                        return res.status(401).send({message: err.message});
                    }

                    AuthoringSchema.AuthoringUser.findById(payload.sub, function (err, user) {
                        if (!user) {
                            return res.status(400).send({message: 'User not found'});
                        }

                        updateUserFromProfile(user, profile, function (user) {
                            var token = JWT.createJWTFromUser(user);
                            res.send({token: token});
                        });
                    });
                });
            } else {
                findOrCreateUserFromProfile(profile, function (user) {
                    var token = JWT.createJWTFromUser(user);
                    res.send({token: token});
                });
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
            callback(existingUser);
        }

        createUserFromProfile(profile, callback);
    });
}

function createUserFromProfile(profile, callback) {
    var user = new AuthoringSchema.AuthoringUser();
    user.bio = "";
    user.roles = ["author"];
    updateUserFromProfile(user, profile, callback);
}

function updateUserFromProfile(user, profile, callback) {
    user.googleID = profile.sub;
    user.name = user.name || profile.name;
    user.email = user.email || profile.email;
    user.save(function () {
        callback(user);
    });
}

function getPublicKey(req, res, next) {
    res.send({publicKey: JWT.getPublicJWT()});
}

