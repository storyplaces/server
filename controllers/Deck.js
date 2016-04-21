/**
 * Created by kep1u13 on 21/04/2016.
 */

"use strict";

var CoreSchema = require('../models/coreschema');

exports.fetch = fetch;

function fetch(req, res, next) {
    CoreSchema.Story.findById(req.params.story_id, function (err, story) {
        if (!story) {
            err.status = 404;
            err.clientMessage = "Story not found";
            return next(err);
        }

        if (err) {
           return next(err);
        }
        res.json(story.deck);
    });
}