//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

var errors = require('../../conversion/SchemaConversionErrors');
var factories = require('../utils/testing-factories');

var chapterFunctions = require('../../conversion/Chapters');
var locationFunctions = require('../../conversion/Locations');

var schemaConversionFunctions = require('../../conversion/SchemaConversion');

describe("Schema conversion", function () {
    var readingStory;
    var authoringStory;
    var page1;
    var chapter1;

    beforeEach(function () {
        page1 = factories.basicPage("p1", "Page1");
        chapter1 = factories.basicChapter("c1", "Chapter 1");
        authoringStory = factories.basicAuthoringStory("s1", "Story 1", "Description", "audience", []);
        authoringStory.pages.push(page1);
        authoringStory.chapters.push(chapter1);
    });

    describe("convert method", function () {
        context("when passed a valid reading story", function () {
            describe("chapter handlers", function () {
                context("there are chapters in the authoring story", function () {
                    it("creates a chapter unlocked condition", function () {
                        readingStory = schemaConversionFunctions.convert(authoringStory, "pending");
                        var expectedConditionId = chapterFunctions.makeChapterUnlockedConditionId("c1");

                        readingStory.conditions.getById(expectedConditionId).should.not.equal(undefined);
                    });

                    it("creates a chapter lock function", function () {
                        readingStory = schemaConversionFunctions.convert(authoringStory, "pending");
                        var expectedFunctionId = chapterFunctions.makeChapterLockFunctionId("c1");

                        readingStory.functions.getById(expectedFunctionId).should.not.equal(undefined);
                    });

                    it("creates a chapter chain function", function () {
                        readingStory = schemaConversionFunctions.convert(authoringStory, "pending");
                        var expectedFunctionId = chapterFunctions.makeChapterChainFunctionId("c1");

                        readingStory.functions.getById(expectedFunctionId).should.not.equal(undefined);
                    });
                });

                context("there are no chapters in the authoring story", function () {
                    beforeEach(function () {
                        authoringStory.chapters = [];
                    });

                    it("creates no chapter unlocked conditions", function () {
                        readingStory = schemaConversionFunctions.convert(authoringStory, "pending");
                        var expectedConditionId = chapterFunctions.makeChapterUnlockedConditionId("c1");

                        should.equal(undefined, readingStory.conditions.getById(expectedConditionId));
                    });

                    it("creates no chapter lock functions", function () {
                        readingStory = schemaConversionFunctions.convert(authoringStory, "pending");
                        var expectedFunctionId = chapterFunctions.makeChapterLockFunctionId("c1");

                        should.equal(undefined, readingStory.conditions.getById(expectedFunctionId));
                    });
                    it("creates no chapter chain functions", function () {
                        readingStory = schemaConversionFunctions.convert(authoringStory, "pending");
                        var expectedFunctionId = chapterFunctions.makeChapterChainFunctionId(chapter1.id);

                        should.equal(undefined, readingStory.conditions.getById(expectedFunctionId));
                    });
                });
            });

            describe("page handlers", function () {
                context("there are pages in the authoring story", function () {
                    it("creates a page", function () {
                        readingStory = schemaConversionFunctions.convert(authoringStory, "pending");
                        readingStory.pages.getById(page1.id).should.not.equal(undefined);
                    });
                });

                context("there are no pages in the authoring story", function () {
                    beforeEach(function () {
                        authoringStory.pages = [];
                    });
                    it("does not create a page", function () {
                        readingStory = schemaConversionFunctions.convert(authoringStory, "pending");
                        readingStory.pages.length.should.equal(0);
                    });
                });
            });

            describe("location handlers", function () {
                context("there are locations in the reading story", function () {
                    var location;
                    beforeEach(function () {
                        location = factories.basicAuthoringLocation("l1", 1, 2, 3);
                        authoringStory.locations.push(location);
                        authoringStory.pages[0].locationId = "l1";
                    });

                    it("creates a location", function () {
                        readingStory = schemaConversionFunctions.convert(authoringStory, "pending");
                        readingStory.locations.length.should.not.equal(0);
                    });

                    it("creates a location condition", function () {
                        readingStory = schemaConversionFunctions.convert(authoringStory, "pending");
                        var expectedConditionId = locationFunctions.makeLocationConditionId(location.id);
                        readingStory.conditions.getById(expectedConditionId).should.not.equal(undefined);
                    });
                });

                context("there are no locations in the reading story", function () {
                    beforeEach(function () {
                        readingStory.locations = [];
                    });
                    it("does not create a location condition", function () {
                        readingStory = schemaConversionFunctions.convert(authoringStory, "pending");
                        readingStory.locations.length.should.equal(0);
                    });
                });
            });
        });
    });

    context("when passed an invalid reading story", function () {
        context("when the story is undefined", function () {
           it("throws and exception", function () {
               expect(function () {
                   schemaConversionFunctions.convert(undefined, "pending");
               }).to.throw(errors.SchemaConversionError);
           })
        });

        context("when the story id is undefined", function () {
            beforeEach(function () {
               readingStory.id = undefined;
            });

           it("throws and exception", function () {
               expect(function () {
                   schemaConversionFunctions.convert(readingStory, "pending");
               }).to.throw(errors.SchemaConversionError);
           })
        });
    });
});
