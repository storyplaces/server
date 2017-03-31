"use strict";

module.exports = hasPrivileges;

var Authorisation = require('../auth/Authorisation');

function hasPrivileges(requiredPrivileges, match) {
    return function (req, res, next) {

        var privileges = Authorisation.convertRolesToPrivileges(req.internal.user.roles);

        if (!Array.isArray(requiredPrivileges)) {
            requiredPrivileges = [requiredPrivileges];
        }

        if (!privileges || !Authorisation.hasPrivileges(requiredPrivileges, privileges, match)) {
            return res.status(403).send({message: 'Permission denied'});
        }

        next();
    };
}

