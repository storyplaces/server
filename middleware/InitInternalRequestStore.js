"use strict";


module.exports = initInternalRequestStore;

function initInternalRequestStore(req, res, next) {
    req.internal = {};
    next();
}