"use strict";

//region Convert
exports.convert = convert;

var errors = require('./SchemaConversionErrors');


function convert(authoringStory) {
    // Create basic story
    var readingStory = createReadingStory(authoringStory);

    // Conditions and functions for chapters
    authoringStory.chapters.forEach(function (chapter) {
        createChapterLockCondition(chapter, readingStory);
        createChapterLockFunctions(chapter, readingStory);
        createChapterChainFunction(chapter, readingStory, authoringStory);
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
function getChapterUnlockChainFunctionIds(page, authoringStory) {
    return authoringStory.chapters.filter(function (chapter) {
        return chapter.unlockedByPageIds.indexOf(page.id) != -1;
    }).map(function (chapter) {
        return makeChapterChainFunctionId(chapter.id);
    });
}

function processPage(page, authoringStory, readingStory) {
    if (!page.id) {
        throw new errors.SchemaConversionError("Unable to process page as it doesn't have an ID")
    }

    createPageReadCondition(page, readingStory);

    // Pre Processing
    var locationId = createLocation(page.locationId, authoringStory, readingStory);

    var markPageAsReadFunctionId = createMarkPageAsReadFunction(page, readingStory);
    var unlockChapterFunctionIds = getChapterUnlockChainFunctionIds(page, authoringStory);

    var locationConditionId = makeLocationConditionId(locationId);
    var allowMultipleReadingsConditionId = createAllowMultipleReadingsCondition(page, readingStory);
    var chapterMembershipConditionId = createChapterMembershipCondition(page, readingStory, authoringStory);
    var pageUnlockedByConditionId = createUnlockedByPagesCondition(page, readingStory);

    var functions = [];
    var conditions = [];

    addFunction(markPageAsReadFunctionId, functions);
    functions = functions.concat(unlockChapterFunctionIds);

    addCondition(locationConditionId, conditions);
    addCondition(allowMultipleReadingsConditionId, conditions);
    addCondition(chapterMembershipConditionId, conditions);
    addCondition(pageUnlockedByConditionId, conditions);

    return {
        id: page.id,
        content: page.content,
        name: page.name,
        pageTransition: page.finishesStory ? "end" : "next",
        hint: {
            direction: page.pageHint,
            locations: locationId ? [locationId] : []
        },
        conditions: conditions,
        functions: functions
    };
}

function createUnlockedByPagesCondition(page, readingStory) {

    var id = 'page-unlocked-' + page.id;

    var conditionIds = page.unlockedByPageIds.map(makePageReadConditionId);

    if (page.unlockedByPagesOperator == 'and') {
        return createAndCondition(id, conditionIds, readingStory);
    }

    return createOrCondition(id, conditionIds, readingStory);
}

function createPageReadCondition(page, readingStory) {
    var id = makePageReadConditionId(page.id);
    checkIdDoesNotExist(id, readingStory.conditions);
    createConditionVariableIsTrue(id, makePageReadVariableId(page.id), readingStory);
    return id;
}

function makePageReadConditionId(pageId) {
    return 'page-read-' + pageId;
}

//endregion

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

//region Story
function createReadingStory(authoringStory) {
    return {
        name: authoringStory.title,
        description: authoringStory.description,
        audience: authoringStory.audience,
        tags: authoringStory.tags.length != 0 ? authoringStory.tags : ["untagged"],
        publishState: "pending",
        locations: [],
        conditions: [],
        functions: [],
        pages: []
    };
}
//endregion

//region PageRead
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

function createChainFunction(id, conditions, functions, readingStory) {
    checkIdDoesNotExist(id, readingStory.functions);
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
//endregion

function createOrCondition(id, conditionIds, readingStory) {
    checkIdDoesNotExist(id, readingStory.conditions);
    readingStory.conditions.push(makeLogicalCondition(id, "OR", conditionIds));
    return id;
}

function createAndCondition(id, conditionIds, readingStory) {
    checkIdDoesNotExist(id, readingStory.conditions);
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

//region Chapter

function makeChapterChainCondition(chapter, readingStory) {
    var id = makeChapterChainConditionId(chapter.id);
    checkIdDoesNotExist(id, readingStory.conditions);

    var conditionIds = chapter.unlockedByPageIds.map(function (pageId) {
        return makePageReadConditionId(pageId);
    });

    if (conditionIds.length == 0) {
        return undefined;
    }

    if (chapter.unlockedByPagesOperator == "and") {
        return createAndCondition(id, conditionIds, readingStory);
    }

    return createOrCondition(id, conditionIds, readingStory);
}

function getAllOtherChapterIds(currentChapterId, chapters) {
    return chapters.map(function (chapter) {
        return chapter.id
    }).filter(function (chapterId) {
        return chapterId != currentChapterId
    });
}

function createChapterChainFunction(chapter, readingStory, authoringStory) {
    var id = makeChapterChainFunctionId(chapter.id);
    checkIdDoesNotExist(id, readingStory.functions);

    var conditionId = makeChapterChainCondition(chapter, readingStory);
    var chaptersToLock = chapter.locksAllOtherChapters ? getAllOtherChapterIds(chapter.id, authoringStory.chapters) : chapter.locksChapterIds;
    var functionsIds = [makeChapterUnlockFunctionId(chapter.id)].concat(chaptersToLock.map(makeChapterLockFunctionId));

    var conditions = conditionId ? [conditionId] : [];
    return createChainFunction(id, conditions, functionsIds, readingStory);
}

function makeChapterChainFunctionId(chapterId) {
    return "chapter-chain-function-" + chapterId;
}

function makeChapterChainConditionId(chapterId) {
    return "chapter-chain-condition-" + chapterId;
}

function createChapterMembershipCondition(page, readingStory, authoringStory) {
    var chapterConditionIds = authoringStory.chapters.filter(function (chapter) {
        return chapter.pageIds.indexOf(page.id) != -1;
    }).map(function (chapter) {
        return makeChapterConditionId(chapter.id);
    });

    if (chapterConditionIds.length == 0) {
        return undefined;
    }

    return createOrCondition('page-chapters-' + page.id, chapterConditionIds, readingStory);
}

function createChapterLockCondition(chapter, readingStory) {
    var id = makeChapterConditionId(chapter.id);
    var variableId = makeChapterUnlockedVariableId(chapter.id);
    return createConditionVariableIsTrue(id, variableId, readingStory);
}

function createChapterLockFunctions(chapter, readingStory) {
    if (!chapter.id) {
        throw new errors.SchemaConversionError("Unable to make chapter function as it doesn't have an ID");
    }

    var variableId = makeChapterUnlockedVariableId(chapter.id);
    createSetFunction(makeChapterUnlockFunctionId(chapter.id), variableId, "true", [], readingStory);
    createSetFunction(makeChapterLockFunctionId(chapter.id), variableId, "false", [], readingStory);
}

function makeChapterUnlockedVariableId(chapterId) {
    return "chapter-unlocked" + chapterId + "-variable";
}

function makeChapterLockFunctionId(chapterId) {
    return "chapter-" + chapterId + "-lock";
}

function makeChapterUnlockFunctionId(chapterId) {
    return "chapter-" + chapterId + "-unlock";
}

function makeChapterConditionId(chapterId) {
    if (!chapterId) {
        throw new errors.SchemaConversionError("Unable to add chapter as it doesn't have an ID")
    }

    return "chapter-unlocked-" + chapterId;
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
    if (!locationId) {
        return undefined;
    }

    return "location-" + locationId;
}
//endregion
