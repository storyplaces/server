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
exports.readingsForUser = allReadingsForUser;

function create(req, res, next) {

    var story = new CoreSchema.Story(req.body);

    story.save(function (err) {
        if (err) {
            err.status = 400;
            err.clientMessage = "Unable To save story";
            return next(err);
        }

        res.json({message: 'Story created!'});
    });
}

function index(req, res, next) {
    CoreSchema.Story.find(function (err, stories) {
        if (err) {
            return next(err);
        }

        res.json(stories);
    });
}

function fetch(req, res, next) {
    CoreSchema.Story.findById(req.params.story_id, function (err, story) {
        if (!story&&err) {
            err.status = 404;
            err.clientMessage = "Story not found";
            return next(err);
        }

        if (err) {
            return next(err);
        }

        res.json(story);
    });
}

function destroy(req, res, next) {
    CoreSchema.Story.remove(
        { _id: req.params.story_id },
        function (err, story) {
            if (!story) {
                err.status = 400;
                err.clientMessage = "Unable to delete story";
                return next(err);
            }

            if (err) {
                return next(err);
            }

            res.json({message: 'Successfully deleted'});
        });
}

function allReadings(req, res, next) {
    CoreSchema.Reading.find({"story": req.params.story_id}, function (err, readings) {
        if (err) {
            return next(err);
        }

        res.json(readings);
    });
}

function allReadingsForUser(req, res, next) {
    CoreSchema.Reading.find({"story": req.params.story_id, "user": req.params.user_id}, function (err, readings) {
        if (err) {
            return next(err);
        }

        res.json(readings);
    });
}