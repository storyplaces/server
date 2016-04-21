/**
 * Created by kep1u13 on 21/04/2016.
 */

"use strict";

var CoreSchema = require('../models/coreschema');

exports.create = create;
exports.index = index;

function create(req, res) {

    var user = new CoreSchema.User();

    console.log("NEW USER");

    user.creationDate = new Date();

    user.save(function (err) {
        if (err) {
            res.send(err);
        }

        res.json(user);
    });
}

function index(req, res) {
    CoreSchema.User.find(function (err, users) {
        if (err) {
            res.send(err);
        }

        res.json(users);
    });
}