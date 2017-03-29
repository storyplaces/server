"use strict";

// Taken from https://github.com/sahat/satellizer/blob/master/examples/server/node/server.js

module.exports = validateUser;

var AuthoringSchema = require('../models/authoringSchema');

function validateUser(req, res, next) {
    AuthoringSchema.AuthoringUser.findById(req.internal.userId, function (err, user) {
        if (!user) {
            return res.status(401).send({message: 'User not found'});
        }

        if (!user.enabled) {
            return res.status(401).send({message: 'User disabled'});
        }

        req.internal.user = user;
        next();
    });
}

