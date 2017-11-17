"use strict";

let errors = require('./SchemaConversionErrors');
let utils = require('./Utils');

exports.addAdvancedFunctions = addAdvancedFunctions;

function makeSetFunction(advFunction) {
    return {
        id: advFunction.id,
        type: "set",
        variable: advFunction.variableId,
        value: advFunction.value,
        conditions: advFunction.conditionIds
    };
}

function makeSetTimeStampFunction(advFunction) {
    return {
        id: advFunction.id,
        type: "settimestamp",
        variable: advFunction.variableId,
        conditions: advFunction.conditionIds
    };
}

function makeIncrementFunction(advFunction) {
    return {
        id: advFunction.id,
        type: "increment",
        variable: advFunction.variableId,
        value: advFunction.value,
        conditions: advFunction.conditionIds
    };
}

function makeChainFunction(advFunction) {
    return {
        id: advFunction.id,
        type: "chain",
        functions: advFunction.chainFunctionIds,
        conditions: advFunction.conditionIds
    };
}

function convertFunction(advFunction) {
    utils.validateId(advFunction.id);

    if (advFunction.variableId) {
        utils.validateId(advFunction.variableId);
    }

    if (advFunction.chainFunctionIds) {
        advFunction.chainFunctionIds.forEach(id => utils.validateId(id));
    }

    if (advFunction.conditionIds) {
        advFunction.conditionIds.forEach(id => utils.validateId(id));
    }

   switch (advFunction.type) {
       case "set": return makeSetFunction(advFunction);
       case "settimestamp": return makeSetTimeStampFunction(advFunction);
       case "increment": return makeIncrementFunction(advFunction);
       case "chain": return makeChainFunction(advFunction);
       default : throw new errors.SchemaConversionError("Invalid advanced function type");
   }
}

function addAdvancedFunctions(readingStory, authoringStory) {
    if (!authoringStory.advancedFunctions) {
        return;
    }

    authoringStory.advancedFunctions.forEach(advFunction => {
        readingStory.functions.push(convertFunction(advFunction));
    });
}