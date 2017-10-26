/**
 * Created by kep1u13 on 01/02/2017.
 */

"use strict";

exports.validateId = validateId;
exports.sanitizeInboundIds = sanitizeInboundIds;
exports.sanitizeAndValidateInboundIds = sanitizeAndValidateInboundIds;
exports.sanitizeOutboundObject = sanitizeOutboundObject;
exports.sanitizeOutboundJson = sanitizeOutboundJson;

let fs = require('fs');

function validateId(passedId) {
    let id = passedId.replace(/[^0-9A-F]/gi, '');

    if (id !== passedId) {
        throw new Error("Bad characters passed in the id");
    }

    return id;
}

function sanitizeInboundIds(objectBody) {
    delete objectBody.id;
    delete objectBody._id;
    delete objectBody.__v;

    return objectBody;
}

function sanitizeAndValidateInboundIds(objectId, objectBody) {
    if (objectBody.id && objectBody.id !== objectId) {
        throw new Error("Invalid Ids");
    }

    if (objectBody._id && objectBody._id !== objectId) {
        throw new Error("Invalid Ids");
    }

    return sanitizeInboundIds(objectBody);
}

function sanitizeOutboundJson(jsonToSend) {
    delete jsonToSend._id;
    delete jsonToSend.__v;

    return jsonToSend
}

function sanitizeOutboundObject(object) {
    let jsonToSend = object.toJSON();

    return sanitizeOutboundJson(jsonToSend);
}