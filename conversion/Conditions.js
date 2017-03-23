/**
 * Created by kep1u13 on 16/03/2017.
 */

"use strict";

exports.createOrCondition = createOrCondition;
exports.createAndCondition = createAndCondition;
exports.createCheckCondition = createCheckCondition;
exports.createComparisonCondition = createComparisonCondition;
exports.createConditionVariableIsTrue = createConditionVariableIsTrue;
exports.createConditionVariableIsFalse = createConditionVariableIsFalse;
exports.createConditionVariableIsNotTrue = createConditionVariableIsNotTrue;

var utils = require('./Utils');
var errors = require('./SchemaConversionErrors');

function createCheckCondition(id, variableId, readingStory) {
    if (!id) {
        throw new errors.SchemaConversionError("Unable to create OR condition with no ID");
    }

    utils.checkIdDoesNotExist(id, readingStory.conditions);
    readingStory.conditions.push(makeCheckCondition(id, variableId));
    return id;
}

function makeCheckCondition(id, variableId) {
    return {
        id: id,
        type: "check",
        variable: variableId
    };
}

function createConditionVariableIsTrue(id, variableId, readingStory) {
    return createComparisonCondition(id, variableId, "==", "true", readingStory, "String");
}

function createConditionVariableIsFalse(id, variableId, readingStory) {
    return createComparisonCondition(id, variableId, "==", "false", readingStory, "String");
}

function createConditionVariableIsNotTrue(id, variableId, readingStory) {
    return createComparisonCondition(id, variableId, "!=", "true", readingStory, "String");
}

function createComparisonCondition(id, variableId, comparison, value, readingStory, valueType) {
    if (!id) {
        throw new errors.SchemaConversionError("Unable to create OR condition with no ID");
    }

    utils.checkIdDoesNotExist(id, readingStory.conditions);
    readingStory.conditions.push(makeComparisonCondition(id, variableId, value, comparison, valueType));
    return id;
}

function makeComparisonCondition(id, variableId, value, operand, valueType) {
    return {
        id: id,
        type: 'comparison',
        operand: operand,
        aType: 'Variable',
        a: variableId,
        bType: valueType || 'String',
        b: value
    };
}

function createOrCondition(id, conditionIds, readingStory) {
    if (!id) {
        throw new errors.SchemaConversionError("Unable to create OR condition with no ID");
    }

    utils.checkIdDoesNotExist(id, readingStory.conditions);
    readingStory.conditions.push(makeLogicalCondition(id, "OR", conditionIds));
    return id;
}

function createAndCondition(id, conditionIds, readingStory) {
    if (!id) {
        throw new errors.SchemaConversionError("Unable to create OR condition with no ID");
    }

    utils.checkIdDoesNotExist(id, readingStory.conditions);
    readingStory.conditions.push(makeLogicalCondition(id, "AND", conditionIds));
    return id;
}

function makeLogicalCondition(id, operand, conditionIds) {
    return {
        id: id,
        operand: operand,
        conditions: conditionIds,
        type: "logical"
    }
}
