"use strict";

let errors = require('./SchemaConversionErrors');
let utils = require('./Utils');

exports.addAdvancedConditions = addAdvancedConditions;

function makeTimeRangeCondition(advCondition) {
    return {
        id: advCondition.id,
        type: "timerange",
        variable: advCondition.variableId,
        start: advCondition.start,
        end: advCondition.end
    };
}

function makeComparisonCondition(advCondition) {
    return {
        id: advCondition.id,
        type: "comparison",
        a: advCondition.variableA,
        b: advCondition.variableB,
        aType: advCondition.variableAType,
        bType: advCondition.variableBType,
        operand: advCondition.operand
    };
}

function makeCheckCondition(advCondition) {
    return {
        id: advCondition.id,
        type: "check",
        variable: advCondition.variableId
    };
}

function makeLocationCondition(advCondition) {
    return {
        id: advCondition.id,
        type: "location",
        location: advCondition.locationId
    };
}

function makeLogicalCondition(advCondition) {
    return {
        id: advCondition.id,
        type: "logical",
        operand: advCondition.operand,
        conditions: advCondition.conditionIds
    };
}

function makeTimePassedCondition(advCondition) {
    return {
        id: advCondition.id,
        type: "timepassed",
        variable: advCondition.variableId,
        minutes: advCondition.minutes
    };
}

function convertCondition(advCondition) {
    utils.validateId(advCondition.id);

    if (advCondition.variableId) {
        utils.validateId(advCondition.variableId);
    }

    if (advCondition.variableA) {
        utils.validateId(advCondition.variableA);
    }

    if (advCondition.variableB) {
        utils.validateId(advCondition.variableB);
    }

    if (advCondition.locationId) {
        utils.validateId(advCondition.locationId);
    }

    if (advCondition.conditionIds) {
        advCondition.conditionIds.forEach(id => utils.validateId(id));
    }

    if (advCondition.variableAType && ['Integer', 'String', 'Variable'].indexOf(advCondition.variableAType) === -1) {
        throw new errors.SchemaConversionError('Invalid variable A type');
    }

    if (advCondition.variableBType && ['Integer', 'String', 'Variable'].indexOf(advCondition.variableBType) === -1) {
        throw new errors.SchemaConversionError('Invalid variable B type');
    }

    if (advCondition.operand && ['AND', 'OR', '==', '!=', '<', '>', '<=', '>=', '>='].indexOf(advCondition.operand) === -1) {
        throw new errors.SchemaConversionError('Invalid operand type');
    }

    switch (advCondition.type) {
        case 'comparison' :
            return makeComparisonCondition(advCondition);
        case 'check' :
            return makeCheckCondition(advCondition);
        case 'location' :
            return makeLocationCondition(advCondition);
        case 'logical' :
            return makeLogicalCondition(advCondition);
        case 'timepassed' :
            return makeTimePassedCondition(advCondition);
        case 'timerange' :
            return makeTimeRangeCondition(advCondition);
        default :
            throw new errors.SchemaConversionError("Invalid advanced Condition type");
    }
}

function addAdvancedConditions(readingStory, authoringStory) {
    if (!authoringStory.advancedConditions) {
        return;
    }

    authoringStory.advancedConditions.forEach(advCondition => {
        readingStory.conditions.push(convertCondition(advCondition));
    });
}