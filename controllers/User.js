/**
 * Created by kep1u13 on 21/04/2016.
 */

"use strict";

var CoreSchema = require('../models/coreschema');

exports.create = create;
exports.index = index;

function create(req, res, next) {

    var user = new CoreSchema.User();
    var Logger = require('../utilities/Logger.js');

    user.creationDate = new Date();

    user.save(function (err) {
        if (err) {
            return next(err);
        }

        Logger.log("Create new user");
        res.json(user);
    });
}

function index(req, res, next) {
    CoreSchema.User.find(function (err, users) {
        if (err) {
            return next(err);
        }

        res.json(users);
    });
}