/**
 * Created by kep1u13 on 21/04/2016.
 */

"use strict";

var CoreSchema = require('../models/coreschema');

exports.create = create;
exports.index = index;
exports.update = update;
exports.fetch = fetch;

function create(req, res, next) {

    var reading = new CoreSchema.Reading(req.body);

    reading.save(function (err) {
        if (err) {
            err.status = 400;
            err.clientMessage = "Unable To save reading";
            return next(err);
        }

        res.json({message: 'Reading created!'});
    });
}

function index(req, res, next) {
    CoreSchema.Reading.find(function (err, readings) {
        if (err) {
            return next(err);
        }

        res.json(readings);
    });
}

function fetch(req, res, next) {
    CoreSchema.Reading.findById(req.params.reading_id, function (err, reading) {
        if (!reading) {
            err.status = 404;
            err.clientMessage = "Reading not found";
            return next(err);
        }

        if (err) {
            return next(err);
        }

        res.json(reading);
    });
}

function update(req, res, next) {
    CoreSchema.Reading.findByIdAndUpdate(req.params.reading_id, {variables: req.body.variables}, function (err, reading) {
        if (!reading) {
            err.status = 400;
            err.clientMessage = "Unable To update reading";
            return next(err);
        }

        if (err) {
            return next(err);
        }

        res.json({message: 'Reading updated!'});
    });
};