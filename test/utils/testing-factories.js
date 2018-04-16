exports.basicPage = basicPage;
exports.basicChapter = basicChapter;
exports.basicReadingStory = basicReadingStory;
exports.basicAuthoringStory = basicAuthoringStory;
exports.basicAuthoringLocation = basicAuthoringLocation;
exports.basicReadingLocation = basicReadingLocation;
exports.advancedLocation = advancedLocation;
exports.advancedTimeRangeCondition = advancedTimeRangeCondition;
exports.advancedComparisonCondition = advancedComparisonCondition;
exports.advancedCheckCondition = advancedCheckCondition;
exports.advancedLocationCondition = advancedLocationCondition;
exports.advancedLogicalCondition = advancedLogicalCondition;
exports.advancedTimePassedCondition = advancedTimePassedCondition;

function basicChapter(id, name) {
    return {
        id: id,
        name: name || "Test Chapter",
        colour: "blue",
        pageIds: [],
        allowMultipleReadings: false,
        unlockedByPageIds: [],
        unlockedByPagesOperator: "and",
        locksAllOtherChapters: false,
        locksChapterIds: []
    };
}

function basicPage(id, name) {
    return {
        id: id,
        name: name || "New Page",
        content: "",
        pageHint: "",
        locationId: "",
        allowMultipleReadings: false,
        unlockedByPageIds: [],
        unlockedByPagesOperator: "and",
        finishesStory: false
    };
}

function basicReadingStory(id, title) {
    return {
        id: id,
        title: title,
        conditions: [],
        pages: [],
        functions: [],
        locations: []
    };
}

function basicAuthoringStory(id, title, description, audience, tags) {
    return {
        id: id,
        title: title,
        description: description,
        audience: audience,
        tags: tags,
        pages: [],
        functions: [],
        locations: [],
        chapters: []
    }
}

function basicAuthoringLocation(id, lat, long, radius) {
    return {
        id: id,
        lat: lat,
        long: long,
        radius: radius,
        type: 'circle'
    }
}

function basicReadingLocation(id, lat, long, radius) {
    return {
        id: id,
        lat: lat,
        lon: long,
        radius: radius,
        type: 'circle'
    }
}

function advancedLocation(id, lat, long,radius) {
    return {
        id: id,
        lat: lat,
        long: long,
        radius: radius,
        type: 'circle'
    }
}

function advancedTimeRangeCondition(id, variableId, start, end) {
    return {
        id: id,
        variableId: variableId,
        start: start,
        end: end,
        type: 'timerange'
    }
}

function advancedComparisonCondition(id, variableA, variableB, variableAType, variableBType, operand) {
    return {
        id: id,
        variableA: variableA,
        variableB: variableB,
        variableAType: variableAType,
        variableBType: variableBType,
        operand: operand,
        type: 'comparison'
    }
}

function advancedCheckCondition(id, variableId) {
    return {
        id: id,
        variableId: variableId,
        type: 'check'
    }
}

function advancedLocationCondition(id, locationId) {
    return {
        id: id,
        locationId: locationId,
        type: 'location'
    }
}

function advancedLogicalCondition(id, operand, conditionIds) {
    return {
        id: id,
        operand: operand,
        conditionIds: conditionIds,
        type: 'logical'
    }
}

function advancedTimePassedCondition(id, variableId, minutes) {
    return {
        id: id,
        variableId: variableId,
        minutes: minutes,
        type: 'timepassed'
    }
}


