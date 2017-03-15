"use strict";

//region Convert
exports.convert = convert;

var errors = require('./SchemaConversionErrors');

function convert(authoringStory) {
    // Create basic story
    var readingStory = createReadingStory(authoringStory);

    // Conditions and functions for chapters
    authoringStory.chapters.forEach(function (chapter) {
        var chapterConditionId = createChapterCondition(chapter, readingStory);
        var chapterFunctionId = createChapterFunctions(chapter, readingStory);
    });

    // Create and add pages
    authoringStory.pages.forEach(function (page) {
        var newPage = processPage(page, authoringStory, readingStory);
        readingStory.pages.push(newPage);
    });

    // Add conditions for chapters
    authoringStory.chapters.forEach(function (chapter) {
        // TODO - Add conditions to pages
    });

    readingStory.locations.forEach(function (location) {
        createLocationCondition(location, readingStory);
    });

    return readingStory;
}
//endregion

//region Page

function createChapterMembershipCondition(page, readingStory, authoringStory) {
    var chapterConditionIds = authoringStory.chapters.filter(function (chapter) {
        return chapter.pageIds.indexOf(page.id) != -1;
    }).map(function (chapter) {
        return makeChapterConditionId(chapter.id);
    });

    return createOrCondition('page-chapters-' + page.id, chapterConditionIds, readingStory);
}

function processPage(page, authoringStory, readingStory) {
    if (!page.id) {
        throw new errors.SchemaConversionError("Unable to process page as it doesn't have an ID")
    }

    // Pre Processing
    var locationId = createLocation(page.locationId, authoringStory, readingStory);
    var locationConditionId = makeLocationConditionId(locationId);

    var allowMultipleReadingsConditionId = createAllowMultipleReadingsCondition(page, readingStory);
    var markPageAsReadFunctionId = createMarkPageAsReadFunction(page, readingStory);
    var chapterMembershipConditionId = createChapterMembershipCondition(page, readingStory, authoringStory);

    var functions = [markPageAsReadFunctionId];
    var conditions = [];

    if (locationConditionId) {
        conditions.push(locationConditionId);
    }

    if (allowMultipleReadingsConditionId) {
        conditions.push(allowMultipleReadingsConditionId);
    }

    if (chapterMembershipConditionId) {
        conditions.push(chapterMembershipConditionId);
    }

    return {
        id: page.id,
        content: page.content,
        name: page.name,
        pageTransition: page.finishesStory ? "finish" : "next",
        hint: {
            direction: page.pageHint,
            locations: locationId ? [locationId] : []
        },
        conditions: conditions,
        functions: functions
    };
}
//endregion

//region Story
function createReadingStory(authoringStory) {
    return {
        name: authoringStory.title,
        description: authoringStory.description,
        audience: authoringStory.audience,
        tags: authoringStory.tags,
        publishState: "pending",
        locations: [],
        conditions: [],
        functions: [],
        pages: []
    };
}
//endregion

//region Page Read
function createMarkPageAsReadFunction(page, readingStory) {
    var id = makePageReadFunctionId(page.id);
    var variableId = makePageReadVariableId(page.id);
    return createSetFunction(id, variableId, "true", [], readingStory);
}

function makePageReadFunctionId(pageId) {
    return "page-read-" + pageId;
}

function makePageReadVariableId(pageId) {
    return "page-read-" + pageId + "-variable";
}
//

//region MultipleReadings
function createAllowMultipleReadingsCondition(page, readingStory) {
    if (page.allowMultipleReadings) {
        return undefined;
    }

    var id = makeAllowMultipleReadingsConditionId(page.id);
    var variableId = makePageReadVariableId(page.id);
    return createConditionVariableIsNotTrue(id, variableId, readingStory);
}

function makeAllowMultipleReadingsConditionId(pageId) {
    return "page-not-read-" + pageId;
}
//endregion

//region Checks
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
//endregion

//region Conditions
function createCheckCondition(id, variableId, readingStory) {
    checkIdDoesNotExist(id, readingStory.conditions);
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
    checkIdDoesNotExist(id, readingStory.conditions);
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

//endregion

//region Functions
function createSetFunction(id, variableId, value, conditions, readingStory) {
    checkIdDoesNotExist(id, readingStory.functions);
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
//endregion

function createOrCondition(id, conditionIds, readingStory) {
    checkIdDoesNotExist(id, readingStory.conditions);
    readingStory.conditions.push(makeLogicalCondition(id, "or", conditionIds));
    return id;
}

function createAndCondition(id, conditionIds, readingStory) {
    checkIdDoesNotExist(id, readingStory.conditions);
    readingStory.conditions.push(makeLogicalCondition(id, "and", conditionIds));
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

//region Chapter

function createChapterCondition(chapter, readingStory) {
    var id = makeChapterConditionId(chapter.id);
    var variableId = "chapter-" + chapter.id + "-variable";
    return createConditionVariableIsTrue(id, variableId, readingStory);
}

function createChapterFunctions(chapter, readingStory) {
    var variable = "chapter-" + chapter.id + "-variable";
    createSetFunction(makeChapterFunctionId(chapter.id, true), variable, "true", [], readingStory);
    createSetFunction(makeChapterFunctionId(chapter.id, false), variable, "false", [], readingStory);
}

function makeChapterFunctionId(chapterId, enter) {
    if (!chapterId) {
        return undefined;
    }

    if (enter) {
        return "chapter-" + chapterId + "-enter";
    }
    return "chapter-" + chapterId + "-leave";
}

function makeChapterConditionId(chapterId) {
    if (!chapterId) {
        throw new errors.SchemaConversionError("Unable to add chapter as it doesn't have an ID")
    }

    return "chapter-" + chapterId;
}
//endregion

//region Location
function createLocation(locationId, authoringStory, readingStory) {
    if (!locationId) {
        return undefined
    }

    var location = findLocationFromAuthoringStory(locationId, authoringStory);

    switch (location.type) {
        case "circle":
            return copyCircleLocation(location, readingStory);
        default:
            throw new errors.SchemaConversionError("Unknown location type");
    }
}

function findLocationFromAuthoringStory(locationId, authoringStory) {
    return authoringStory.locations.filter(function (location) {
        return location.id == locationId
    }).pop();
}

function copyCircleLocation(location, readingStory) {
    var existingLocations = readingStory.locations.filter(function (readingLocation) {
        if (readingLocation.type != "circle") {
            return false;
        }

        var latMatches = readingLocation.lat == location.lat;
        var lonMatches = readingLocation.lon == location.long;
        var radiusMatches = readingLocation.radius == location.radius;
        return latMatches && lonMatches && radiusMatches;
    });

    if (existingLocations.length != 0) {
        return existingLocations.pop().id;
    }

    readingStory.locations.push(makeLocation(location));

    return location.id;
}

function makeLocation(location) {
    return {
        id: location.id,
        lat: location.lat,
        lon: location.long,
        radius: location.radius,
        type: "circle"
    };
}

function createLocationCondition(location, readingStory) {
    readingStory.conditions.push({
        id: makeLocationConditionId(location.id),
        location: location.id,
        bool: "true",
        type: "location"
    });
}

function makeLocationConditionId(locationId) {
    return "location-" + locationId;
}
//endregion
