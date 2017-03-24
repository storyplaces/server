/**
 * Created by kep1u13 on 16/03/2017.
 */

"use strict";

exports.createChapterChainFunction = createChapterChainFunction;
exports.createChapterLockFunctions = createChapterLockFunctions;
exports.createChapterUnlockedCondition = createChapterUnlockedCondition;
exports.getChapterUnlockChainFunctionIds = getChapterUnlockChainFunctionIds;
exports.createChapterMembershipCondition = createChapterMembershipCondition;

// Only really used for testing
exports.makeChapterLockFunctionId = makeChapterLockFunctionId;
exports.makeChapterUnlockFunctionId = makeChapterUnlockFunctionId;
exports.makeChapterUnlockedVariableId = makeChapterUnlockedVariableId;
exports.makeChapterChainFunctionId = makeChapterChainFunctionId;

var utils = require('./Utils');
var pageFunctions = require('./Pages');
var functionFunctions = require('./Functions');
var conditionFunctions = require('./Conditions');
var errors = require('./SchemaConversionErrors');

/** Chapter Chain **/

function makeChapterUnlockChainCondition(chapter, readingStory) {
    var id = makeChapterChainConditionId(chapter.id);
    utils.checkIdDoesNotExist(id, readingStory.conditions);

    var conditionIds = chapter.unlockedByPageIds.map(function (pageId) {
        return pageFunctions.makePageReadConditionId(pageId);
    });

    if (conditionIds.length == 0) {
        return undefined;
    }

    if (chapter.unlockedByPagesOperator == "and") {
        return conditionFunctions.createAndCondition(id, conditionIds, readingStory);
    }

    return conditionFunctions.createOrCondition(id, conditionIds, readingStory);
}

function getChapterUnlockChainFunctionIds(page, authoringStory) {
    validateIdentifiableObject(page);

    return authoringStory.chapters.filter(function (chapter) {
        return chapter.unlockedByPageIds.indexOf(page.id) != -1;
    }).map(function (chapter) {
        return makeChapterChainFunctionId(chapter.id);
    });
}


function createChapterChainFunction(chapter, readingStory, authoringStory) {
    validateIdentifiableObject(chapter);

    var id = makeChapterChainFunctionId(chapter.id);
    utils.checkIdDoesNotExist(id, readingStory.functions);

    var conditionId = makeChapterUnlockChainCondition(chapter, readingStory);
    var chaptersToLock = chapter.locksAllOtherChapters ? getAllOtherChapterIds(chapter.id, authoringStory.chapters) : chapter.locksChapterIds;
    var functionsIds = [makeChapterUnlockFunctionId(chapter.id)].concat(chaptersToLock.map(makeChapterLockFunctionId));

    var conditions = conditionId ? [conditionId] : [];
    return functionFunctions.createChainFunction(id, conditions, functionsIds, readingStory);
}

function makeChapterChainFunctionId(chapterId) {
    return "chapter-chain-function-" + chapterId;
}

function makeChapterChainConditionId(chapterId) {
    return "chapter-chain-condition-" + chapterId;
}

/** Chapter Membership **/

function createChapterMembershipCondition(page, readingStory, authoringStory) {
    validateIdentifiableObject(page);

    var chapterConditionIds = authoringStory.chapters.filter(function (chapter) {
        return chapter.pageIds.indexOf(page.id) != -1;
    }).map(function (chapter) {
        return makeChapterUnlockedConditionId(chapter.id);
    });

    if (chapterConditionIds.length == 0) {
        return undefined;
    }

    return conditionFunctions.createOrCondition('page-chapters-' + page.id, chapterConditionIds, readingStory);
}

function createChapterUnlockedCondition(chapter, readingStory) {
    validateIdentifiableObject(chapter);

    var id = makeChapterUnlockedConditionId(chapter.id);
    var variableId = makeChapterUnlockedVariableId(chapter.id);
    return conditionFunctions.createConditionVariableIsTrue(id, variableId, readingStory);
}

/** Chapter locking/unlocking **/

function createChapterLockFunctions(chapter, readingStory) {
    validateIdentifiableObject(chapter);

    var variableId = makeChapterUnlockedVariableId(chapter.id);
    var unlockId = functionFunctions.createSetFunction(makeChapterUnlockFunctionId(chapter.id), variableId, "true", [], readingStory);
    var lockId = functionFunctions.createSetFunction(makeChapterLockFunctionId(chapter.id), variableId, "false", [], readingStory);
    return {lockFunctionId: lockId, unlockFunctionId: unlockId};
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

function makeChapterUnlockedConditionId(chapterId) {
    if (!chapterId) {
        throw new errors.SchemaConversionError("Unable to add chapter as it doesn't have an ID")
    }

    return "chapter-unlocked-" + chapterId;
}

/** Helpers **/

function getAllOtherChapterIds(currentChapterId, chapters) {
    return chapters.map(function (chapter) {
        return chapter.id
    }).filter(function (chapterId) {
        return chapterId != currentChapterId
    });
}

function validateIdentifiableObject(chapter) {
    if (!chapter || !chapter.id) {
        throw new errors.SchemaConversionError("Unable to make chapter function as it doesn't have an ID");
    }
}