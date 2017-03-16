/**
 * Created by kep1u13 on 16/03/2017.
 */

"use strict";

exports.createSetFunction = createSetFunction;
exports.createChainFunction = createChainFunction;

var utils = require('./Utils');

function createSetFunction(id, variableId, value, conditions, readingStory) {
    utils.checkIdDoesNotExist(id, readingStory.functions);
    readingStory.functions.push(makeSetFunction(id, variableId, value, conditions));
    return id;
}

function makeSetFunction(id, variableId, value, conditions) {
    return {
        id: id,
        type: "set",
        variable: variableId,
        value: value,
        conditions: conditions
    }
}

function createChainFunction(id, conditions, functions, readingStory) {
    utils.checkIdDoesNotExist(id, readingStory.functions);
    readingStory.functions.push(makeChainFunction(id, conditions, functions));
    return id;
}

function makeChainFunction(id, conditions, functions) {
    return {
        id: id,
        conditions: conditions,
        functions: functions,
        type: "chain"
    }
}