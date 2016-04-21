/**
 * Created by kep1u13 on 21/04/2016.
 */

"use strict";

var CoreSchema = require('../models/coreschema');

exports.fetch = fetch;

function fetch(req, res) {
    CoreSchema.Story.findById(req.params.story_id, function (err, story) {
        if (err) {
            res.send(err);
        }
        res.json(story.deck);
    });
}