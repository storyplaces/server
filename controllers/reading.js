/**
 * Created by kep1u13 on 21/04/2016.
 */

"use strict";

var CoreSchema = require('../models/coreschema');

exports.create = create;
exports.index = index;
exports.update = update;
//exports.show = show;
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

function update(req, res) {

    var reading = new CoreSchema.Reading(req.body);

    reading.save(function (err) {
        if (err) {
            res.send(err);
        }

        res.json({message: 'Reading Updated!'});
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