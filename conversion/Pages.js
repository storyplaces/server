/**
 * Created by kep1u13 on 16/03/2017.
 */

"use strict";

exports.processPage = processPage;
exports.makePageReadFunctionId = makePageReadFunctionId;
exports.makePageReadConditionId = makePageReadConditionId;
exports.makeUnlockedByPagesConditionId = makeUnlockedByPagesConditionId;
exports.makeAllowMultipleReadingsConditionId = makeAllowMultipleReadingsConditionId;

var utils = require('./Utils');
var chapterFunctions = require('./Chapters');
var functionFunctions = require('./Functions');
var locationFunctions = require('./Locations');
var conditionFunctions = require('./Conditions');
var errors = require('./SchemaConversionErrors');
var helpers = require('../controllers/helpers');

let markdown = require('./Markdown');

function processPage(page, authoringStory, readingStory) {
    if (!page || !page.id) {
        throw new errors.SchemaConversionError("Unable to process page as it doesn't have an ID")
    }

    createPageReadCondition(page, readingStory);

    // Pre Processing
    var locationId = locationFunctions.createLocation(page.locationId, authoringStory, readingStory);

    var markPageAsReadFunctionId = createMarkPageAsReadFunction(page, readingStory);
    var unlockChapterFunctionIds = chapterFunctions.getChapterUnlockChainFunctionIds(page, authoringStory);

    var locationConditionId = locationFunctions.makeLocationConditionId(locationId);
    var allowMultipleReadingsConditionId = createAllowMultipleReadingsCondition(page, readingStory);
    var chapterMembershipConditionId = chapterFunctions.createChapterMembershipCondition(page, readingStory, authoringStory);
    var pageUnlockedByConditionId = createUnlockedByPagesCondition(page, readingStory);

    var functions = [];
    var conditions = [];

    utils.addFunction(markPageAsReadFunctionId, functions);
    functions = functions.concat(unlockChapterFunctionIds);

    utils.addCondition(locationConditionId, conditions);
    utils.addCondition(allowMultipleReadingsConditionId, conditions);
    utils.addCondition(chapterMembershipConditionId, conditions);
    utils.addCondition(pageUnlockedByConditionId, conditions);

    handleImage(page, authoringStory, readingStory);
    handleAudio(page, authoringStory, readingStory);

    readingStory.pages.push({
        id: page.id,
        content: buildPageContent(page),
        name: page.name,
        pageTransition: page.finishesStory ? "end" : "next",
        hint: {
            direction: page.pageHint,
            locations: locationId ? [locationId] : []
        },
        conditions: conditions,
        functions: functions,
    });

    return page.id;
}

function handleImage(page, authoringStory, readingStory) {

    if (page.imageId && authoringStory.imageIds.indexOf(page.imageId) !== -1) {
        addImageToStory(page.imageId, authoringStory, readingStory);
    }
    return page.imageId;
}

function addImageToStory(imageId, authoringStory, readingStory) {
    readingStory.cachedMediaIds.push(imageId);
    return imageId;
}

function handleAudio(page, authoringStory, readingStory) {

    if (page.audioId && authoringStory.audioIds.indexOf(page.audioId) !== -1) {
        addAudioToStory(page.audioId, authoringStory, readingStory);
    }
    return page.audioId;
}

function addAudioToStory(audioId, authoringStory, readingStory) {
    readingStory.cachedMediaIds.push(audioId);
    return audioId;
}

function buildPageContent(page) {

    let html = markdown.render(page.content);

    if (page.audioId) {
        html = addAudioTagsToPageContent(page.audioId, html);
    }

    if (page.imageId) {
        html = addImageTagsToPageContent(page.imageId, html);

    }

    return html;

}

function addImageTagsToPageContent(imageId, pageContent) {
    var imageBlock = "<img style='max-width: 100%; display: block; margin: auto;' data-media-id='" + imageId + "'/><br/><br/>";
    return imageBlock + pageContent;
}
function addAudioTagsToPageContent(audioId, pageContent) {
    var audioBlock = "<audio data-media-id='" + audioId + "'></audio><br/><br/>";
    return audioBlock + pageContent;
}

function makeUnlockedByPagesConditionId(pageId) {
    return 'page-unlocked-' + pageId;
}

function createUnlockedByPagesCondition(page, readingStory) {

    var id = makeUnlockedByPagesConditionId(page.id);

    var conditionIds = page.unlockedByPageIds.map(makePageReadConditionId);

    if (conditionIds.length === 0) {
        return undefined;
    }

    if (page.unlockedByPagesOperator == 'and') {
        return conditionFunctions.createAndCondition(id, conditionIds, readingStory);
    }

    return conditionFunctions.createOrCondition(id, conditionIds, readingStory);
}

function createPageReadCondition(page, readingStory) {
    var id = makePageReadConditionId(page.id);
    utils.checkIdDoesNotExist(id, readingStory.conditions);
    conditionFunctions.createConditionVariableIsTrue(id, makePageReadVariableId(page.id), readingStory);
    return id;
}

function createMarkPageAsReadFunction(page, readingStory) {
    var id = makePageReadFunctionId(page.id);
    var variableId = makePageReadVariableId(page.id);
    return functionFunctions.createSetFunction(id, variableId, "true", [], readingStory);
}

function makePageReadConditionId(pageId) {
    return 'page-read-' + pageId;
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
    return conditionFunctions.createConditionVariableIsNotTrue(id, variableId, readingStory);
}

function makeAllowMultipleReadingsConditionId(pageId) {
    return "page-not-read-" + pageId;
}