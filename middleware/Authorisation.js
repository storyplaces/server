"use strict";

module.exports = checkPrivileges;

var Authorisation = require('../auth/Authorisation');
var moment = require('moment');

function checkPrivileges(requiredPrivileges, match) {
    return function (req, res, next) {
        if (!Array.isArray(requiredPrivileges)) {
            requiredPrivileges = [requiredPrivileges];
        }

        if (!req.privileges || !Authorisation.hasPrivileges(requiredPrivileges, req.privileges, match)) {
            return res.status(403).send({message: 'Permission denied'});
        }

        next();
    };
}

