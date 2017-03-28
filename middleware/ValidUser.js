"use strict";

// Taken from https://github.com/sahat/satellizer/blob/master/examples/server/node/server.js

module.exports = validateUser;

var AuthoringSchema = require('../models/authoringSchema');

function validateUser(req, res, next) {
    AuthoringSchema.AuthoringUser.findById(req.user, function (err, user) {
        if (!user) {
            return res.status(400).send({message: 'User not found'});
        }
        next();
    });
}

