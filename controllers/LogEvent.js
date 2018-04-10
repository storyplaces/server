/* *****************************************************************************
 *
 * StoryPlaces
 *

 This application was developed as part of the Leverhulme Trust funded
 StoryPlaces Project. For more information, please visit storyplaces.soton.ac.uk

 Copyright (c) 2016
 University of Southampton
 Charlie Hargood, cah07r.ecs.soton.ac.uk
 Kevin Puplett, k.e.puplett.soton.ac.uk
 David Pepper, d.pepper.soton.ac.uk

 All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:
 * Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in the
 documentation and/or other materials provided with the distribution.
 * The name of the Universities of Southampton nor the name of its
 contributors may be used to endorse or promote products derived from
 this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 ARE DISCLAIMED. IN NO EVENT SHALL THE ABOVE COPYRIGHT HOLDERS BE LIABLE FOR ANY
 DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

 ***************************************************************************** */

"use strict";

var CoreSchema = require('../models/coreschema');
var helpers = require('./helpers.js');

exports.create = create;
exports.index = index;
exports.fetch = fetch;
exports.userFetch = userFetch;
exports.fetchRange = fetchRange;

function create(req, res, next) {

    let requestBody = helpers.sanitizeAndValidateInboundIds(undefined, req.body);

    var logevent = new CoreSchema.LogEvent(requestBody);

    logevent.save(function (err) {
        if (err) {
            err.status = 400;
            err.clientMessage = "Unable To save logevent";
            return next(err);
        }

        let toSend = helpers.sanitizeOutboundObject(logevent);

        res.json(toSend);
    });
}

function index(req, res, next) {
    CoreSchema.LogEvent.find(function (err, logevents) {
        if (err) {
            return next(err);
        }

        let toSend = logevents.map(event => helpers.sanitizeOutboundObject(event));

        res.json(toSend);
    });
}

function fetch(req, res, next) {
    try {
        var logEventId = helpers.validateId(req.params.logevent_id);
    } catch (error) {
        return next(error);
    }

    CoreSchema.LogEvent.findById(logEventId, function (err, logevent) {
        if (err) {
            return next(err);
        }

        if (!logevent) {
            var error = new Error();
            error.status = 404;
            error.clientMessage = error.message = "LogEvent not found";
            return next(error);
        }

        let toSend = helpers.sanitizeOutboundObject(logevent);

        res.json(toSend);
    });
}

function userFetch(req, res, next) {
    try {
        var userId = helpers.validateId(req.params.user_id);
    } catch (error) {
        return next(error);
    }

    CoreSchema.LogEvent.find({"user": userId}, function (err, logevents) {
        if (err) {
            return next(err);
        }

        let toSend = logevents.map(event => helpers.sanitizeOutboundObject(event));

        res.json(toSend);
    });
}

function fetchRange(req, res, next) {
    try {
        var startTime = new Date(parseInt(req.params.start));
        var finishTime = new Date(parseInt(req.params.finish));
    } catch (error) {
        return next(error);
    }
    CoreSchema.LogEvent.find({
            "date":
                {
                    $gte: startTime.getTime(),
                    $lt: finishTime.getTime()
                }
        },
        function (err, logevents) {
            if (err) {
                return next(err);
            }

            let toSend = logevents.map(event => helpers.sanitizeOutboundObject(event));

            res.json(toSend);
        }
    );
}
