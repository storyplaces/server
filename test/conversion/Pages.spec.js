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

describe("Pages conversion", function () {
    var readingStory;
    var authoringStory;
    var page1, page2;
    var chapter1, chapter2;

    beforeEach(function () {
        readingStory = factories.basicReadingStory("s1", "Story 1");

        page1 = factories.basicPage("p1", "Page1");
        page2 = factories.basicPage("p2", "Page2");
        chapter1 = factories.basicChapter("c1", "Chapter 1");
        chapter2 = factories.basicChapter("c2", "Chapter 2");
        authoringStory = factories.basicAuthoringStory("s1", "Story 1", "Description", "audience", []);
        authoringStory.pages.push(page1, page2);
        authoringStory.chapters.push(chapter1, chapter2);
    });

    describe("processPage method", function () {
        context("when given good data", function () {
            it("returns the id of the new page", function () {
                var id = pageFunctions.processPage(page1, authoringStory, readingStory);
                id.should.not.equal(undefined);
            });
            it("returns different IDs for different pages", function () {
                var id1 = pageFunctions.processPage(page1, authoringStory, readingStory);
                var id2 = pageFunctions.processPage(page2, authoringStory, readingStory);

                id1.should.not.equal(id2);
            });
            it("throws and exception if it tries to add multiple pages with the same id", function () {
                pageFunctions.processPage(page1, authoringStory, readingStory);
                expect(function () {
                    pageFunctions.processPage(page1, authoringStory, readingStory);
                }).to.throw(errors.SchemaConversionError);
            });
            it("creates the page in the reading story pages list", function () {
                var id = pageFunctions.processPage(page1, authoringStory, readingStory);
                readingStory.pages.getById(id).should.not.equal(undefined);
            });

            describe("creating a reading story", function () {
                var id;
                var createdPage;
                beforeEach(function () {
                    page1.content = "some content";
                    page1.pageHint = "hint";
                    id = pageFunctions.processPage(page1, authoringStory, readingStory);
                    createdPage = readingStory.pages.getById(id);
                });

                it("sets the page id", function () {
                    createdPage.id.should.equal(id);
                });

                it("sets the page content", function () {
                    createdPage.content.should.equal("some content");
                });

                it("sets the page name", function () {
                    createdPage.name.should.equal("Page1");
                });

                it("sets the page hint", function () {
                    createdPage.hint.direction.should.equal("hint");
                });
            });

            describe("page transition handler", function () {
                context("when the authoring page is not marked as a finish page", function () {
                    it("sets the reading page transition to 'next'", function () {
                        page1.finishesStory = false;
                        var createdPage = processAndGetPage(page1, authoringStory, readingStory);
                        createdPage.pageTransition.should.equal('next');
                    });
                });
                context("when the authoring page is marked as a finish page", function () {
                    it("sets the reading page transition to 'end'", function () {
                        page1.finishesStory = true;
                        var createdPage = processAndGetPage(page1, authoringStory, readingStory);
                        createdPage.pageTransition.should.equal('end');
                    });
                });
            });

            describe("location handler", function () {
                var location1;
                var location2;

                beforeEach(function () {
                    location1 = factories.basicAuthoringLocation("l1", 1, 2, 3);
                    location2 = factories.basicAuthoringLocation("l2", 4, 5, 6);
                    authoringStory.locations.push(location1, location2);
                });

                context("when the authoring page has an associated location", function () {
                    beforeEach(function () {
                        page1.locationId = location1.id;
                    });

                    it("sets the location id to the new location", function () {
                        var createdPage = processAndGetPage(page1, authoringStory, readingStory);
                        createdPage.hint.locations.length.should.equal(1);
                    });

                    it("has a location condition added to the pages list of conditions", function () {
                        var createdPage = processAndGetPage(page1, authoringStory, readingStory);
                        var expectedConditionId = locationFunctions.makeLocationConditionId(createdPage.hint.locations[0]);
                        createdPage.conditions.contains(expectedConditionId).should.equal(true);
                    });

                    it("has added the location to the reading story location list", function () {
                        var createdPage = processAndGetPage(page1, authoringStory, readingStory);
                        readingStory.locations.getById(createdPage.hint.locations[0]).should.not.equal(undefined);
                    });
                });

                context("when the authoring page does not have an associated location", function () {
                    beforeEach(function () {
                        page1.locationId = undefined;
                    });

                    it("does not set the location Id", function () {
                        var createdPage = processAndGetPage(page1, authoringStory, readingStory);
                        createdPage.hint.locations.length.should.equal(0);
                    });

                    it("does not set a location condition in the pages condition list");

                    it("has not changed the reading story location list", function () {
                        var initialNumberOfLocations = readingStory.locations.length;
                        processAndGetPage(page1, authoringStory, readingStory);
                        var currentNumberOfLocations = readingStory.locations.length;

                        initialNumberOfLocations.should.equal(currentNumberOfLocations);
                    });
                });
            });

            describe("page read condition handler", function () {
                it("creates a page read condition", function () {
                    pageFunctions.processPage(page1, authoringStory, readingStory);
                    var expectedConditionId = pageFunctions.makePageReadConditionId(page1.id);

                    readingStory.conditions.getById(expectedConditionId).should.not.equal(undefined);
                });
            });

            describe("mark page as read function handler", function () {
                it("creates a mark page as read function", function () {
                    pageFunctions.processPage(page1, authoringStory, readingStory);
                    var expectedFunctionId = pageFunctions.makePageReadFunctionId(page1.id);

                    readingStory.functions.getById(expectedFunctionId).should.not.equal(undefined);
                });

                it("adds the function to the page's function list", function () {
                    var createdPage = processAndGetPage(page1, authoringStory, readingStory);
                    var expectedFunctionId = pageFunctions.makePageReadFunctionId(page1.id);

                    createdPage.functions.contains(expectedFunctionId).should.equal(true);
                });
            });

            describe("chapter membership handler", function () {
                context("when the page is a member of chapters", function () {
                    beforeEach(function () {
                        chapter1.pageIds=["p1"];
                    });

                    it("creates a chapter membership condition", function () {
                        processAndGetPage(page1, authoringStory, readingStory);
                        var expectedConditionId = chapterFunctions.makeChapterMembershipConditionId(page1.id);

                        readingStory.conditions.getById(expectedConditionId).should.not.equal(undefined);
                    });

                    it("adds the chapter membership condition to the conditions of the page", function () {
                        var createdPage = processAndGetPage(page1, authoringStory, readingStory);
                        var expectedConditionId = chapterFunctions.makeChapterMembershipConditionId(page1.id);

                        createdPage.conditions.contains(expectedConditionId).should.equal(true);
                    });
                });

                context("when the page is not a member of any chapters", function () {
                    beforeEach(function () {
                        chapter1.pageIds=[];
                    });

                    it("does not create a chapter membership condition", function () {
                        processAndGetPage(page1, authoringStory, readingStory);
                        var expectedConditionId = chapterFunctions.makeChapterMembershipConditionId(page1.id);

                        should.equal(undefined, readingStory.conditions.getById(expectedConditionId));
                    });

                    it("does not add anything to the conditions of the page", function () {
                        var createdPage = processAndGetPage(page1, authoringStory, readingStory);
                        var expectedConditionId = chapterFunctions.makeChapterMembershipConditionId(page1.id);

                        createdPage.conditions.contains(expectedConditionId).should.equal(false);
                    });
                });
            });

            describe("chapter unlocking handler", function () {
                context("when the page unlocks a chapter", function () {
                    beforeEach(function () {
                        chapter1.unlockedByPageIds=["p1"];
                        chapter2.unlockedByPageIds=[];
                    });

                    it("adds the chapter unlock function to the page functions", function () {
                        var createdPage = processAndGetPage(page1, authoringStory, readingStory);
                        var expectedFunction1 = chapterFunctions.makeChapterChainFunctionId(chapter1.id);
                        var expectedFunction2 = chapterFunctions.makeChapterChainFunctionId(chapter2.id);

                        createdPage.functions.contains(expectedFunction1).should.equal(true);
                        createdPage.functions.contains(expectedFunction2).should.equal(false);
                    });
                });

                context("when the page unlocks multiple chapters", function () {
                    beforeEach(function () {
                        chapter1.unlockedByPageIds=["p1"];
                        chapter2.unlockedByPageIds=["p1"];
                    });

                    it("adds all the chapter unlock functions to the page functions", function () {
                        var createdPage = processAndGetPage(page1, authoringStory, readingStory);
                        var expectedFunction1 = chapterFunctions.makeChapterChainFunctionId(chapter1.id);
                        var expectedFunction2 = chapterFunctions.makeChapterChainFunctionId(chapter2.id);

                        createdPage.functions.contains(expectedFunction1).should.equal(true);
                        createdPage.functions.contains(expectedFunction2).should.equal(true);
                    });
                });

                context("when the page does not unlock a chapter", function () {
                    beforeEach(function () {
                        chapter1.unlockedByPageIds=[];
                        chapter2.unlockedByPageIds=[];
                    });

                    it("does not nothing to the page functions", function () {
                        var createdPage = processAndGetPage(page1, authoringStory, readingStory);
                        var expectedFunction1 = chapterFunctions.makeChapterChainFunctionId(chapter1.id);
                        var expectedFunction2 = chapterFunctions.makeChapterChainFunctionId(chapter2.id);

                        createdPage.functions.contains(expectedFunction1).should.equal(false);
                        createdPage.functions.contains(expectedFunction2).should.equal(false);
                    });
                });
            });

            describe("unlocked by pages handler", function () {
                context("when the page is unlocked by other pages", function () {
                    beforeEach(function () {
                        page1.unlockedByPageIds = ["p2"];
                    });

                    it("creates a unlocked by pages condition", function () {
                        processAndGetPage(page1, authoringStory, readingStory);
                        var expectedConditionId = pageFunctions.makeUnlockedByPagesConditionId(page1.id);

                        readingStory.conditions.getById(expectedConditionId).should.not.equal(undefined);
                    });

                    it("adds the condition to the pages conditions", function () {
                        var createdPage = processAndGetPage(page1, authoringStory, readingStory);
                        var expectedConditionId = pageFunctions.makeUnlockedByPagesConditionId(page1.id);

                        createdPage.conditions.contains(expectedConditionId).should.equal(true);
                    });
                });

                context("when the page is not unlocked by other pages", function () {
                    beforeEach(function () {
                        page1.unlockedByPageIds = [];
                    });

                    it("does not create a unlocked by pages condition", function () {
                        processAndGetPage(page1, authoringStory, readingStory);
                        var expectedConditionId = pageFunctions.makeUnlockedByPagesConditionId(page1.id);

                        should.equal(undefined, readingStory.conditions.getById(expectedConditionId));
                    });

                    it("does nothing to the pages condition list", function () {
                        var createdPage = processAndGetPage(page1, authoringStory, readingStory);
                        var expectedConditionId = pageFunctions.makeUnlockedByPagesConditionId(page1.id);

                        createdPage.conditions.contains(expectedConditionId).should.equal(false);
                    });
                });
            });

            describe("allow multiple readings handler", function () {
                context("when the page can be read once", function () {
                    beforeEach(function () {
                        page1.allowMultipleReadings = false;
                    });

                    it("creates a page not read conditions", function () {
                        processAndGetPage(page1, authoringStory, readingStory);
                        var expectedConditionId = pageFunctions.makeAllowMultipleReadingsConditionId(page1.id);

                        readingStory.conditions.getById(expectedConditionId).should.not.equal(undefined);
                    });

                    it("adds the page not read condition to pages condition list", function () {
                        var createdPage = processAndGetPage(page1, authoringStory, readingStory);
                        var expectedConditionId = pageFunctions.makeAllowMultipleReadingsConditionId(page1.id);

                        createdPage.conditions.contains(expectedConditionId).should.equal(true);
                    });
                });

                context("when the page can be read multiple times", function () {
                    beforeEach(function () {
                        page1.allowMultipleReadings = true;
                    });

                    it("does not create a page not read condition", function () {
                        processAndGetPage(page1, authoringStory, readingStory);
                        var expectedConditionId = pageFunctions.makeAllowMultipleReadingsConditionId(page1.id);

                        should.equal(undefined, readingStory.conditions.getById(expectedConditionId));
                    });

                    it("does not change the conditions list", function () {
                        var createdPage = processAndGetPage(page1, authoringStory, readingStory);
                        var expectedConditionId = pageFunctions.makeAllowMultipleReadingsConditionId(page1.id);

                        createdPage.conditions.contains(expectedConditionId).should.equal(false);
                    });
                });
            });
        });

        context("when given bad data", function () {
            it("will throw an exception if the passed page is undefined", function () {
                expect(function () {
                    pageFunctions.processPage(undefined, authoringStory, readingStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("will throw an exception if the passed page id is undefined", function () {
                expect(function () {
                    pageFunctions.processPage({id: undefined}, authoringStory, readingStory);
                }).to.throw(errors.SchemaConversionError);
            });
        })
    });

    describe("makePageReadConditionId", function () {
        it("will return a condition id which is different to the page id", function () {
            var id1 = "id1";
            var result1 = pageFunctions.makePageReadConditionId(id1);
            result1.should.not.equal(id1);
        });

        it("will return a new, unique id when given a page id", function () {
            var id1 = "id1";
            var id2 = "id2";

            var result1 = pageFunctions.makePageReadConditionId(id1);
            var result2 = pageFunctions.makePageReadConditionId(id2);

            result1.should.not.equal(result2);
        });
    });
});

function processAndGetPage(page, authoringStory, readingStory) {
    var id = pageFunctions.processPage(page, authoringStory, readingStory);
    return readingStory.pages.getById(id);
}