"use strict";

module.exports = hasPrivileges;

var Authorisation = require('../auth/Authorisation');

function hasPrivileges(requiredPrivileges, match) {
    return function (req, res, next) {

        if (!Array.isArray(requiredPrivileges)) {
            requiredPrivileges = [requiredPrivileges];
        }

        if (!req.internal.privileges || !Authorisation.hasPrivileges(requiredPrivileges, req.internal.privileges, match)) {
            return res.status(403).send({message: 'Permission denied'});
        }

        next();
    };
}

