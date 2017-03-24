//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

var errors = require('../../conversion/SchemaConversionErrors');
var factories = require('../utils/testing-factories');

var pageFunctions = require('../../conversion/Pages');
var chapterFunctions = require('../../conversion/Chapters');
var locationFunctions = require('../../conversion/Locations');

var schemaConversionFunctions = require('../../conversion/SchemaConversion');

describe("Pages conversion", function () {
    var readingStory;
    var authoringStory;
    var page1, page2;
    var chapter1, chapter2;

    beforeEach(function () {
        page1 = factories.basicPage("p1", "Page1");
        page2 = factories.basicPage("p2", "Page2");
        chapter1 = factories.basicChapter("c1", "Chapter 1");
        chapter2 = factories.basicChapter("c2", "Chapter 2");
        authoringStory = factories.basicAuthoringStory("s1", "Story 1", "Description", "audience", []);
        authoringStory.pages.push(page1, page2);
        authoringStory.chapters.push(chapter1, chapter2);
    });

    describe("processPage method", function () {
        it("does something", function () {
           var readingStory = schemaConversionFunctions.convert(authoringStory);
           console.error(readingStory);
        });
    });
});
