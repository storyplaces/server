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

    var logevent = new CoreSchema.LogEvent(req.body);

    logevent.save(function (err) {
        if (err) {
            err.status = 400;
            err.clientMessage = "Unable To save logevent";
            return next(err);
        }

        res.json(logevent);
    });
}

function index(req, res, next) {
    CoreSchema.LogEvent.find(function (err, logevents) {
        if (err) {
            return next(err);
        }

        res.json(logevents);
    });
}

function fetch(req, res, next) {
    CoreSchema.LogEvent.findById(req.params.logevent_id, function (err, logevent) {
        if (!logevent) {
            err.status = 404;
            err.clientMessage = "LogEvent not found";
            return next(err);
        }

        if (err) {
            return next(err);
        }

        res.json(logevent);
    });
}

function update(req, res, next) {
    CoreSchema.LogEvent.findByIdAndUpdate(req.params.logevent_id, {variables: req.body.variables}, function (err, logevent) {
        if (!logevent) {
            err.status = 400;
            err.clientMessage = "Unable To update logevent";
            return next(err);
        }

        if (err) {
            return next(err);
        }

        res.json(logevent);
    });
}