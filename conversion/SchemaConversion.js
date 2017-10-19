"use strict";


exports.convert = convert;

var pageFunctions = require('./Pages');
var chapterFunctions = require('./Chapters');
var locationFunctions = require('./Locations');
var errors = require('./SchemaConversionErrors');
var createReadingStory = require('./ReadingStory');

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



    return readingStory;
}




















