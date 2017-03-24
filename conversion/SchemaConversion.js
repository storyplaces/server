"use strict";


exports.convert = convert;

var pageFunctions = require('./Pages');
var chapterFunctions = require('./Chapters');
var locationFunctions = require('./Locations');
var createReadingStory = require('./ReadingStory');

function convert(authoringStory) {
    // Create basic story
    var readingStory = createReadingStory.createReadingStory(authoringStory);

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




















