/**
 * Created by kep1u13 on 21/04/2016.
 */

"use strict";

var CoreSchema = require('../models/coreschema');

exports.create = create;
exports.index = index;
exports.fetch = fetch;
exports.destroy = destroy;
exports.allReadings = allReadings;
exports.readingsForUser = readingsForUser;



function create(req, res) {

    var story = new CoreSchema.Story(req.body);

    story.save(function (err) {
        if (err) {
            res.send(err);
        }

        res.json({message: 'Story created!'});
    });
}

function index(req, res) {
    CoreSchema.Story.find(function (err, stories) {
        if (err) {
            res.send(err);
        }

        res.json(stories);
    });
}

function fetch(req, res) {
    CoreSchema.Story.findById(req.params.story_id, function (err, story) {
        if (err) {
            res.send(err);
        }
        res.json(story);
    });
}

function destroy(req, res) {
    CoreSchema.Story.remove({
        _id: req.params.story_id
    }, function (err, story) {
        if (err) {
            res.send(err);
        }

        res.json({message: 'Successfully deleted'});
    });
}

function allReadings(req, res) {
    CoreSchema.Reading.find({"story": req.params.story_id}, function (err, readings) {
        if (err) {
            res.send(err);
        }
        res.json(readings);
    });
}

function readingsForUser(req, res) {
    CoreSchema.Reading.find({"story": req.params.story_id, "user": req.params.user_id}, function (err, readings) {
        if (err) {
            res.send(err);
        }
        res.json(readings);
    });
}