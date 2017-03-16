/**
 * Created by kep1u13 on 16/03/2017.
 */

"use strict";

exports.addFunction = addFunction;
exports.arraysMatch = arraysMatch;
exports.addCondition = addCondition;
exports.checkIdDoesNotExist = checkIdDoesNotExist;

function checkIdDoesNotExist(id, items) {
    var existingItemsMatchingId = items.filter(function (item) {
        return item.id == id;
    });

    if (existingItemsMatchingId.length != 0) {
        throw new errors.SchemaConversionError("Unable to add item as ID already exists");
    }
}

function arraysMatch(array1, array2) {
    var inOneButNotTwo = array1.filter(function (item) {
        return array2.indexOf(item) == -1
    });

    var inTwoButNotOne = array2.filter(function (item) {
        return array1.indexOf(item) == -1
    });

    return inOneButNotTwo.concat(inTwoButNotOne).length == 0;
}

function addCondition(conditionId, conditions) {
    if (!conditionId) {
        return;
    }

    conditions.push(conditionId);
}

function addFunction(functionId, functions) {
    if (!functionId) {
        return;
    }

    functions.push(functionId);
}