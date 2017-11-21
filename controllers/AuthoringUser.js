/*
 * ------------
 * StoryPlaces
 * ------------
 * This application was developed as part of the Leverhulme Trust funded
 * StoryPlaces Project. For more information, please visit storyplaces.soton.ac.uk
 * Copyright (c) 2017 University of Southampton
 *
 * David Millard, dem.soton.ac.uk
 * Andy Day, a.r.day.soton.ac.uk
 * Kevin Puplett, k.e.puplett.soton.ac.uk
 * Charlie Hargood, chargood.bournemouth.ac.uk
 * David Pepper, d.pepper.soton.ac.uk
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * - Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * - The name of the University of Southampton nor the name of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE ABOVE COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

"use strict";

let AuthoringSchema = require('../models/authoringSchema');
let Authorisation = require('../auth/Authorisation');
let helpers = require('./helpers.js');


// exports.create = create;
exports.index = index;
exports.fetch = fetch;
exports.update = update;
exports.assignRoles = assignRoles;

// function create(req, res, next) {
//
//     let authoringUser = new AuthoringSchema.AuthoringUser(req.body);
//
//     authoringUser.save(function (err) {
//         if (err) {
//             err.status = 400;
//             err.clientMessage = "Unable To save Authoring User";
//             return next(err);
//         }
//
//         res.statusCode = 201;
//         res.json({
//             message: 'Authoring User Created',
//             object: authoringUser
//         });
//     });
// }

function index(req, res, next) {
    AuthoringSchema.AuthoringUser.find(function (err, authoringUsers) {
        if (err) {
            return next(err);
        }

        res.json(authoringUsers);
    });
}

function fetch(req, res, next) {
    let userId;

    try {
        userId = helpers.validateId(req.params.user_id);
    } catch (error) {
        return next(error);
    }

    if (Authorisation.doesNotHavePrivileges(['fetchAnyUser'], req.internal.privileges) && userId != req.internal.userId) {
        let error = new Error("Unable to fetch a user which is not currently logged in.");
        error.status = 500;
        error.clientMessage = "Insufficient privileges to fetch this user.";
        return next(error);
    }

    AuthoringSchema.AuthoringUser.findById(userId, function (err, authoringUser) {
        if (err) {
            return next(err);
        }

        if (!authoringUser) {
            let error = new Error("Authoring User id " + userId + " not found");
            error.status = 404;
            error.clientMessage = "Authoring User not found";
            return next(error);
        }

        let objectToSend = helpers.sanitizeOutboundObject(authoringUser);

        // Convert roles to privileges because the front end only understands privileges
        objectToSend.privileges = Authorisation.convertRolesToPrivileges(authoringUser.roles);

        delete objectToSend.googleID;
        delete objectToSend.email;
        delete objectToSend.roles;
        delete objectToSend.enabled;

        res.json(objectToSend);
    });
}

function update(req, res, next) {
    let userId;

    try {
        userId = helpers.validateId(req.params.user_id);
    } catch (error) {
        return next(error);
    }

    let requestBody = helpers.sanitizeAndValidateInboundIds(userId, req.body);

    let update = {
        name: requestBody.name,
        bio: requestBody.bio
    };

    AuthoringSchema.AuthoringUser.findByIdAndUpdate(userId, update, {
        new: true,
        runValidators: true
    }, function (err, authoringUser) {
        if (err) {
            return next(err);
        }

        if (!authoringUser) {
            let error = new Error("Authoring User id " + userId + " not found");
            error.status = 404;
            error.clientMessage = "Authoring User not found";
            return next(error);
        }

        let objectToSend = helpers.sanitizeOutboundObject(authoringUser);

        // Convert roles to privileges because the front end only understands privileges
        objectToSend.privileges = Authorisation.convertRolesToPrivileges(authoringUser.roles);

        delete objectToSend.googleID;
        delete objectToSend.email;
        delete objectToSend.roles;
        delete objectToSend.enabled;

        res.json({
            message: "Authoring User updated",
            object: objectToSend
        });
    });
}

function assignRoles(req, res, next){
    let userId;

    try {
        userId = helpers.validateId(req.params.user_id);
    } catch (error) {
        return next(error);
    }

    let update = {
        roles: req.body.roles,
    };

    AuthoringSchema.AuthoringUser.findByIdAndUpdate(userId, update, {
        runValidators: true
    }, function (err, authoringUser) {
        if (err) {
            return next(err);
        }

        if (!authoringUser) {
            let error = new Error("Authoring User id " + userId + " not found");
            error.status = 404;
            error.clientMessage = "Authoring User not found";
            return next(error);
        }

        let objectToSend = helpers.sanitizeOutboundObject(authoringUser);

        // Convert roles to privileges because the front end only understands privileges
        objectToSend.privileges = Authorisation.convertRolesToPrivileges(authoringUser.roles);

        delete objectToSend.googleID;
        delete objectToSend.email;
        delete objectToSend.enabled;

        res.json({
            message: "Authoring User Roles updated",
            object: objectToSend
        });
    });
}