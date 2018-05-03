"use strict";


exports.convert = convert;

var pageFunctions = require('./Pages');
var chapterFunctions = require('./Chapters');
var locationFunctions = require('./Locations');
var errors = require('./SchemaConversionErrors');
var createReadingStory = require('./ReadingStory');
var utils = require('./Utils');

let advancedLocations = require('./AdvancedLocations');
let advancedFunctions = require('./AdvancedFunctions');
let advancedConditions = require('./AdvancedConditions');

let addHintLocation = function (readingStory, conditionId, readingPage) {
    let condition = readingStory.conditions.find(condition => condition.id == conditionId);

    if (!condition) {
        return;
    }


    if (condition.type === 'logical' && condition.operand === "OR") {
        condition.conditions.forEach(subConditionId => addHintLocation(readingStory, subConditionId, readingPage));
    }

    if (condition.type === 'location' && condition.location && condition.location !== "") {
        let locationId = condition.location;
        readingPage.hint.locations.push(locationId);
    }
};
let processAdvancedPageParts = function (authoringStory, readingStory) {
    authoringStory.pages.forEach(authoringPage => {
        let readingPage = readingStory.pages.find(readingPage => readingPage.id == authoringPage.id);

        if (authoringPage.advancedConditionIds) {
            authoringPage.advancedConditionIds.forEach(conditionId => {
                utils.validateId(conditionId);
                utils.addCondition(conditionId, readingPage.conditions);

                addHintLocation(readingStory, conditionId, readingPage);
            });
        }

        if (authoringPage.advancedFunctionIds) {
            authoringPage.advancedFunctionIds.forEach(functionId => {
                utils.validateId(functionId);
                utils.addFunction(functionId, readingPage.functions);
            });
        }

    });
};

function convert(authoringStory, readingState, authorName) {

    if (!authoringStory || !authoringStory.id) {
        throw new errors.SchemaConversionError("Unable to convert story as it is undefined or its ID is undefined");
    }

    var readingStory = createReadingStory.createReadingStory(authoringStory, readingState, authorName);

    authoringStory.chapters.forEach(function (chapter) {
        chapterFunctions.createChapterUnlockedCondition(chapter, readingStory);
        chapterFunctions.createChapterLockFunctions(chapter, readingStory);
        chapterFunctions.createChapterChainFunction(chapter, readingStory, authoringStory);
    });

    authoringStory.pages.forEach(function (page) {
        pageFunctions.processPage(page, authoringStory, readingStory);
    });

    readingStory.locations.forEach(function (location) {
        locationFunctions.createLocationCondition(location, readingStory);
    });

    advancedLocations.addAdvancedLocations(readingStory, authoringStory);
    advancedFunctions.addAdvancedFunctions(readingStory, authoringStory);
    advancedConditions.addAdvancedConditions(readingStory, authoringStory);
    processAdvancedPageParts(authoringStory, readingStory);

    return readingStory;
}




















