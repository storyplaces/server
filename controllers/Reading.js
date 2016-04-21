/**
 * Created by kep1u13 on 21/04/2016.
 */

"use strict";

var CoreSchema = require('../models/coreschema');

exports.create = create;
exports.index = index;
exports.update = update;
exports.fetch = fetch;
//exports.destroy = destroy;

function create(req, res) {

    var reading = new CoreSchema.Reading(req.body);

    reading.save(function (err) {
        if (err) {
            res.send(err);
        }

        res.json({message: 'Reading created!'});
    });
}

function index(req, res) {
    CoreSchema.Reading.find(function (err, readings) {
        if (err) {
            res.send(err);
        }

        res.json(readings);
    });
}

function fetch(req, res) {
    CoreSchema.Reading.findById(req.params.reading_id, function (err, reading) {
        if (err) {
            res.send(err);
        }
        res.json(reading);
    });
}

function update(req, res) {
    CoreSchema.Reading.findByIdAndUpdate(req.params.reading_id, {variables: req.body.variables}, function (err, reading) {
        if (err) {
            res.send(err);
        }
        res.json({message: 'Reading updated!'});
    });
};