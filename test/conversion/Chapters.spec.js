//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

var chapterFunctions = require('../../conversion/Chapters');
var pageFunctions = require('../../conversion/Pages');
var errors = require("../../conversion/SchemaConversionErrors");

require('../utils/testing-utils');
var factories = require('../utils/testing-factories');

describe("Chapter functions", function () {
    var authoringStory;
    var readingStory;
    var chapter1, chapter2, chapter3;
    var page1, page2, page3;

    beforeEach(function () {
        authoringStory = {conditions: [], functions: [], chapters: [], pages: []};
        readingStory = {conditions: [], functions: [], pages: []};

        chapter1 = factories.basicChapter("c1", "Chapter 1");
        chapter2 = factories.basicChapter("c2", "Chapter 2");
        chapter3 = factories.basicChapter("c3", "Chapter 3");

        page1 = factories.basicPage("p1", "Page 1");
        page2 = factories.basicPage("p2", "Page 2");
        page3 = factories.basicPage("p3", "Page 3");

        authoringStory.chapters.push(chapter1, chapter2, chapter3);
        authoringStory.pages.push(page1, page2, page3);
    });

    describe("createChapterChainFunction", function () {
        context("when passed a valid chapter with a valid id", function () {

            it("will return the id of the new function", function () {
                var id = chapterFunctions.createChapterChainFunction(chapter1, readingStory, authoringStory);

                id.should.not.equal(undefined);
            });

            it("will return a unique id based on the chapter", function () {
                var id1 = chapterFunctions.createChapterChainFunction(chapter1, readingStory, authoringStory);
                var id2 = chapterFunctions.createChapterChainFunction(chapter2, readingStory, authoringStory);

                id2.should.not.equal(id1);
            });

            it("throws an exception if the same condition id is created multiple times", function () {
                chapterFunctions.createChapterChainFunction(chapter1, readingStory, authoringStory);

                expect(function () {
                    chapterFunctions.createChapterChainFunction(chapter1, readingStory, authoringStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("will add the new function to the reading story function array", function () {
                readingStory.functions.length.should.equal(0);

                var id = chapterFunctions.createChapterChainFunction(chapter1, readingStory, authoringStory);

                readingStory.functions.length.should.equal(1);

                var createdFunction = readingStory.functions.getById(id);
                createdFunction.should.not.equal(undefined);
            });

            it("creates a function of type chain", function () {
                var id = chapterFunctions.createChapterChainFunction(chapter1, readingStory, authoringStory);

                var createdFunction = readingStory.functions.getById(id);
                createdFunction.type.should.equal('chain');
            });

            it("adds the unlock chapter function id for the passed chapter to the function chain", function () {
                var id = chapterFunctions.createChapterChainFunction(chapter1, readingStory, authoringStory);

                var createdFunction = readingStory.functions.getById(id);
                var expectedFunctionId = chapterFunctions.makeChapterUnlockFunctionId(chapter1.id);

                createdFunction.functions.contains(expectedFunctionId).should.equal(true);
            });

            describe("locking other chapters", function () {
                context("if the locks all other chapters option is true ignoring the contents of teh locksChapterIds list", function () {
                    beforeEach(function () {
                        chapter1.locksAllOtherChapters = true;
                    });

                    it("will add the chapter lock function ids of all other chapters than the one passed to its chain if the locksChapterIds list is empty", function () {
                        chapter1.locksChapterIds = [];
                        var id = chapterFunctions.createChapterChainFunction(chapter1, readingStory, authoringStory);

                        var createdFunction = readingStory.functions.getById(id);
                        createdFunction.functions.length.should.equal(3); // Two chapters being locked + unlocking this chapter;
                        createdFunction.functions.contains(chapterFunctions.makeChapterLockFunctionId("c1")).should.equal(false);
                        createdFunction.functions.contains(chapterFunctions.makeChapterLockFunctionId("c2")).should.equal(true);
                        createdFunction.functions.contains(chapterFunctions.makeChapterLockFunctionId("c3")).should.equal(true);
                    });

                    it("will add the chapter lock function ids of all other chapters than the one passed to its chain if the locksChapterIds list is not empty", function () {
                        chapter1.locksChapterIds = ["c2", "c3"];
                        var id = chapterFunctions.createChapterChainFunction(chapter1, readingStory, authoringStory);

                        var createdFunction = readingStory.functions.getById(id);
                        createdFunction.functions.length.should.equal(3); // Two chapters being locked + unlocking this chapter;
                        createdFunction.functions.contains(chapterFunctions.makeChapterLockFunctionId("c1")).should.equal(false);
                        createdFunction.functions.contains(chapterFunctions.makeChapterLockFunctionId("c2")).should.equal(true);
                        createdFunction.functions.contains(chapterFunctions.makeChapterLockFunctionId("c3")).should.equal(true);
                    });
                });

                context("if the locks all other chapters option is false", function () {
                    beforeEach(function () {
                        chapter1.locksAllOtherChapters = false;
                    });

                    context("if the locks chapters list is empty", function () {
                        it("add no chapter lock functions to the function list", function () {
                            chapter1.locksChapterIds = [];
                            var id = chapterFunctions.createChapterChainFunction(chapter1, readingStory, authoringStory);

                            var createdFunction = readingStory.functions.getById(id);
                            createdFunction.functions.length.should.equal(1); // Zero chapters being locked + unlocking this chapter;
                            createdFunction.functions.contains(chapterFunctions.makeChapterLockFunctionId("c1")).should.equal(false);
                            createdFunction.functions.contains(chapterFunctions.makeChapterLockFunctionId("c2")).should.equal(false);
                            createdFunction.functions.contains(chapterFunctions.makeChapterLockFunctionId("c3")).should.equal(false);
                        });
                    });

                    context("if the locks chapters list is not empty", function () {
                        it("will add the chapter lock function ids of the listed chapter", function () {
                            chapter1.locksChapterIds = ["c2"];
                            var id = chapterFunctions.createChapterChainFunction(chapter1, readingStory, authoringStory);

                            var createdFunction = readingStory.functions.getById(id);
                            createdFunction.functions.length.should.equal(2); // One chapter being locked + unlocking this chapter;
                            createdFunction.functions.contains(chapterFunctions.makeChapterLockFunctionId("c1")).should.equal(false);
                            createdFunction.functions.contains(chapterFunctions.makeChapterLockFunctionId("c2")).should.equal(true);
                            createdFunction.functions.contains(chapterFunctions.makeChapterLockFunctionId("c3")).should.equal(false);
                        });

                        it("will add the chapter lock function ids of the listed chapters", function () {
                            chapter1.locksChapterIds = ["c2", "c3"];
                            var id = chapterFunctions.createChapterChainFunction(chapter1, readingStory, authoringStory);

                            var createdFunction = readingStory.functions.getById(id);
                            createdFunction.functions.length.should.equal(3); // Two chapters being locked + unlocking this chapter;
                            createdFunction.functions.contains(chapterFunctions.makeChapterLockFunctionId("c1")).should.equal(false);
                            createdFunction.functions.contains(chapterFunctions.makeChapterLockFunctionId("c2")).should.equal(true);
                            createdFunction.functions.contains(chapterFunctions.makeChapterLockFunctionId("c3")).should.equal(true);
                        });
                    });
                });
            });

            describe("being unlocked by pages", function () {
                context("the unlocked by pages list is empty", function () {
                    beforeEach(function () {
                        chapter1.unlockedByPageIds = [];
                    });

                    context("the unlocked by pages switch is set to all pages", function () {
                        beforeEach(function () {
                            chapter1.unlockedByPagesOperator = "and";
                        });

                        it("does not create a condition", function () {
                            var initialNumberOfConditions = readingStory.conditions.length;
                            chapterFunctions.createChapterChainFunction(chapter1, readingStory, authoringStory);
                            var currentNumberOfConditions = readingStory.conditions.length;

                            currentNumberOfConditions.should.equal(initialNumberOfConditions);
                        });

                        it("does not add anything to the condition of the function", function () {
                            var id = chapterFunctions.createChapterChainFunction(chapter1, readingStory, authoringStory);
                            var createdFunction = readingStory.functions.getById(id);

                            createdFunction.conditions.length.should.equal(0);
                        });
                    });

                    context("the unlocked by pages switch is set to any pages", function () {
                        beforeEach(function () {
                            chapter1.unlockedByPagesOperator = "or";
                        });

                        it("does not create a condition", function () {
                            var initialNumberOfConditions = readingStory.conditions.length;
                            chapterFunctions.createChapterChainFunction(chapter1, readingStory, authoringStory);
                            var currentNumberOfConditions = readingStory.conditions.length;

                            currentNumberOfConditions.should.equal(initialNumberOfConditions);
                        });

                        it("does not add anything to the condition of the function", function () {
                            var id = chapterFunctions.createChapterChainFunction(chapter1, readingStory, authoringStory);
                            var createdFunction = readingStory.functions.getById(id);

                            createdFunction.conditions.length.should.equal(0);
                        });
                    });
                });

                context("the unlocked by pages list has items", function () {
                    beforeEach(function () {
                        chapter1.unlockedByPageIds = ["p2", "p3"];
                        chapter2.unlockedByPageIds = ["p1"];
                    });

                    context("the unlocked by pages switch is set to all pages", function () {
                        beforeEach(function () {
                            chapter1.unlockedByPagesOperator = "and";
                            chapter2.unlockedByPagesOperator = "and";
                        });

                        it("creates a logical AND condition and adds the page-read conditions for each page to the condition", function () {
                            var initialNumberOfConditions = readingStory.conditions.length;
                            chapterFunctions.createChapterChainFunction(chapter1, readingStory, authoringStory);
                            var currentNumberOfConditions = readingStory.conditions.length;

                            currentNumberOfConditions.should.equal(initialNumberOfConditions + 1); // ie we have a new condition;

                            var createdCondition = readingStory.conditions.slice(-1).pop(); // Get the last item in the array

                            createdCondition.type.should.equal('logical');
                            createdCondition.operand.should.equal('AND');
                            createdCondition.conditions.length.should.equal(2);
                            createdCondition.conditions.contains(pageFunctions.makePageReadConditionId("p2")).should.equal(true);
                            createdCondition.conditions.contains(pageFunctions.makePageReadConditionId("p3")).should.equal(true);
                        });

                        it("creates uniquely ids for the logical conditions", function () {
                            var initialNumberOfConditions = readingStory.conditions.length;
                            chapterFunctions.createChapterChainFunction(chapter1, readingStory, authoringStory);
                            chapterFunctions.createChapterChainFunction(chapter2, readingStory, authoringStory);
                            var currentNumberOfConditions = readingStory.conditions.length;

                            currentNumberOfConditions.should.equal(initialNumberOfConditions + 2); // ie we have two new conditions;

                            var createdConditions = readingStory.conditions.slice(-2); // Get the last two items in the array

                            createdConditions[0].id.should.not.equal(createdConditions[1].id);
                        });

                        it("adds the ID of the new condition to the condition of the function", function () {
                            var initialNumberOfConditions = readingStory.conditions.length;
                            var id = chapterFunctions.createChapterChainFunction(chapter1, readingStory, authoringStory);
                            var currentNumberOfConditions = readingStory.conditions.length;

                            currentNumberOfConditions.should.equal(initialNumberOfConditions + 1); // ie we have a new condition;

                            var createdCondition = readingStory.conditions.slice(-1).pop(); // Get the last item in the array
                            var createdFunction = readingStory.functions.getById(id);

                            createdFunction.conditions.length.should.equal(1);
                            createdFunction.conditions.contains(createdCondition.id).should.equal(true);
                        });
                    });

                    context("the unlocked by pages switch is set to any pages", function () {
                        beforeEach(function () {
                            chapter1.unlockedByPagesOperator = "or";
                            chapter2.unlockedByPagesOperator = "or";
                        });

                        it("creates a logical OR condition and adds the page-read conditions for each page to the condition", function () {
                            var initialNumberOfConditions = readingStory.conditions.length;
                            chapterFunctions.createChapterChainFunction(chapter1, readingStory, authoringStory);
                            var currentNumberOfConditions = readingStory.conditions.length;

                            currentNumberOfConditions.should.equal(initialNumberOfConditions + 1); // ie we have a new condition;

                            var createdCondition = readingStory.conditions.slice(-1).pop(); // Get the last item in the array

                            createdCondition.type.should.equal('logical');
                            createdCondition.operand.should.equal('OR');
                            createdCondition.conditions.length.should.equal(2);
                            createdCondition.conditions.contains(pageFunctions.makePageReadConditionId("p2")).should.equal(true);
                            createdCondition.conditions.contains(pageFunctions.makePageReadConditionId("p3")).should.equal(true);
                        });

                        it("creates unique ids for the logical conditions", function () {
                            var initialNumberOfConditions = readingStory.conditions.length;
                            chapterFunctions.createChapterChainFunction(chapter1, readingStory, authoringStory);
                            chapterFunctions.createChapterChainFunction(chapter2, readingStory, authoringStory);
                            var currentNumberOfConditions = readingStory.conditions.length;

                            currentNumberOfConditions.should.equal(initialNumberOfConditions + 2); // ie we have two new conditions;

                            var createdConditions = readingStory.conditions.slice(-2); // Get the last two items in the array

                            createdConditions[0].id.should.not.equal(createdConditions[1].id);
                        });

                        it("throws an exception if the same condition id is created multiple times", function () {
                            chapterFunctions.createChapterChainFunction(chapter1, readingStory, authoringStory);

                            expect(function () {
                                chapterFunctions.createChapterChainFunction(chapter1, readingStory, authoringStory);
                            }).to.throw(errors.SchemaConversionError);
                        });

                        it("adds the ID of the new condition to the condition of the function", function () {
                            var initialNumberOfConditions = readingStory.conditions.length;
                            var id = chapterFunctions.createChapterChainFunction(chapter1, readingStory, authoringStory);
                            var currentNumberOfConditions = readingStory.conditions.length;

                            currentNumberOfConditions.should.equal(initialNumberOfConditions + 1); // ie we have a new condition;

                            var createdCondition = readingStory.conditions.slice(-1).pop(); // Get the last item in the array
                            var createdFunction = readingStory.functions.getById(id);

                            createdFunction.conditions.length.should.equal(1);
                            createdFunction.conditions.contains(createdCondition.id).should.equal(true);
                        });
                    });
                });
            });
        });

        context("when passed a malformed chapter", function () {
            it("throws an exception when chapter.id is undefined", function () {
                expect(function () {
                    chapterFunctions.createChapterChainFunction({id: undefined}, readingStory, authoringStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("throws an exception when chapter is undefined", function () {
                expect(function () {
                    chapterFunctions.createChapterChainFunction({id: undefined}, readingStory, authoringStory);
                }).to.throw(errors.SchemaConversionError);
            });
        });
    });

    describe("createChapterLockFunctions", function () {
        context("when passed a valid chapter", function () {
            describe("the lock function", function () {
                it("is created with an ID", function () {
                    var ids = chapterFunctions.createChapterLockFunctions(chapter1, readingStory);
                    ids.lockFunctionId.should.not.equal(undefined);
                });

                it("is created with a unique ID", function () {
                    var c1Ids = chapterFunctions.createChapterLockFunctions(chapter1, readingStory);
                    var c2Ids = chapterFunctions.createChapterLockFunctions(chapter2, readingStory);
                    c1Ids.lockFunctionId.should.not.equal(c2Ids.lockFunctionId);
                });

                it("throws an exception if the same condition id is created multiple times", function () {
                    chapterFunctions.createChapterLockFunctions(chapter1, readingStory);

                    expect(function () {
                        chapterFunctions.createChapterLockFunctions(chapter1, readingStory);
                    }).to.throw(errors.SchemaConversionError);
                });

                it("is added to the function list in the reading story", function () {
                    var ids = chapterFunctions.createChapterLockFunctions(chapter1, readingStory);
                    readingStory.functions.getById(ids.lockFunctionId).should.not.equal(undefined);
                });

                it("creates a set function which sets the chapter unlocked variable to 'false'", function () {
                    var ids = chapterFunctions.createChapterLockFunctions(chapter1, readingStory);
                    var createdFunction = readingStory.functions.getById(ids.lockFunctionId);
                    var expectedVariableId = chapterFunctions.makeChapterUnlockedVariableId(chapter1.id);

                    createdFunction.type.should.equal("set");
                    createdFunction.value.should.equal("false");
                    createdFunction.variable.should.equal(expectedVariableId);
                    createdFunction.conditions.length.should.equal(0);
                });
            });
            describe("the unlock function", function () {
                it("is created with an ID", function () {
                    var ids = chapterFunctions.createChapterLockFunctions(chapter1, readingStory);
                    ids.unlockFunctionId.should.not.equal(undefined);
                });

                it("is created with a unique ID", function () {
                    var c1Ids = chapterFunctions.createChapterLockFunctions(chapter1, readingStory);
                    var c2Ids = chapterFunctions.createChapterLockFunctions(chapter2, readingStory);
                    c1Ids.unlockFunctionId.should.not.equal(c2Ids.unlockFunctionId);
                });

                it("throws an exception if the same condition id is created multiple times", function () {
                    chapterFunctions.createChapterLockFunctions(chapter1, readingStory);

                    expect(function () {
                        chapterFunctions.createChapterLockFunctions(chapter1, readingStory);
                    }).to.throw(errors.SchemaConversionError);
                });

                it("is added to the function list in the reading story", function () {
                    var ids = chapterFunctions.createChapterLockFunctions(chapter1, readingStory);
                    readingStory.functions.getById(ids.unlockFunctionId).should.not.equal(undefined);
                });

                it("creates a set function which sets the chapter unlocked variable to 'true'", function () {
                    var ids = chapterFunctions.createChapterLockFunctions(chapter1, readingStory);
                    var createdFunction = readingStory.functions.getById(ids.unlockFunctionId);
                    var expectedVariableId = chapterFunctions.makeChapterUnlockedVariableId(chapter1.id);

                    createdFunction.type.should.equal("set");
                    createdFunction.value.should.equal("true");
                    createdFunction.variable.should.equal(expectedVariableId);
                    createdFunction.conditions.length.should.equal(0);
                });
            });
        });

        context("when passed an invalid chapter", function () {
            it("throws an exception when chapter.id is undefined", function () {
                expect(function () {
                    chapterFunctions.createChapterLockFunctions({id: undefined}, readingStory);
                }).to.throw(errors.SchemaConversionError);
            });
            it("throws an exception when chapter is undefined", function () {
                expect(function () {
                    chapterFunctions.createChapterLockFunctions(undefined, readingStory);
                }).to.throw(errors.SchemaConversionError);
            });
        });
    });

    describe("createChapterUnlockedCondition", function () {
        context("when passed a valid chapter", function () {
            it("returns the created condition id", function () {
                var id = chapterFunctions.createChapterUnlockedCondition(chapter1, readingStory);
                id.should.not.equal(undefined);
            });

            it("creates the conditions with unique ids", function () {
                var c1Id = chapterFunctions.createChapterUnlockedCondition(chapter1, readingStory);
                var c2Id = chapterFunctions.createChapterUnlockedCondition(chapter2, readingStory);

                c1Id.should.not.equal(c2Id);
            });

            it("throws an exception if the same condition id is created multiple times", function () {
                chapterFunctions.createChapterUnlockedCondition(chapter1, readingStory);

                expect(function () {
                    chapterFunctions.createChapterUnlockedCondition(chapter1, readingStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("adds the condition to the reading story conditions list", function () {
                var id = chapterFunctions.createChapterUnlockedCondition(chapter1, readingStory);

                readingStory.conditions.getById(id).should.not.equal(undefined);
            });

            it("creates a comparison condition which compares the variable to 'true'", function () {
                var id = chapterFunctions.createChapterUnlockedCondition(chapter1, readingStory);
                var createdFunction = readingStory.conditions.getById(id);
                var expectedVariable = chapterFunctions.makeChapterUnlockedVariableId(chapter1.id);

                createdFunction.type.should.equal("comparison");
                createdFunction.operand.should.equal("==");
                createdFunction.aType.should.equal("Variable");
                createdFunction.bType.should.equal("String");
                createdFunction.a.should.equal(expectedVariable);
                createdFunction.b.should.equal("true");
            })
        });

        context("when passed an invalid chapter", function () {
            it("throws an exception when chapter.id is undefined", function () {
                expect(function () {
                    chapterFunctions.createChapterUnlockedCondition({id: undefined}, readingStory);
                }).to.throw(errors.SchemaConversionError);
            });
            it("throws an exception when chapter is undefined", function () {
                expect(function () {
                    chapterFunctions.createChapterUnlockedCondition(undefined, readingStory);
                }).to.throw(errors.SchemaConversionError);
            });
        });
    });

    describe("getChapterUnlockChainFunctionIds", function () {
        context("when passed a valid page which unlocks no chapters", function () {
            it("returns an empty array", function () {
                var result = chapterFunctions.getChapterUnlockChainFunctionIds(page1, authoringStory);
                result.length.should.equal(0);
            });
        });

        context("when passed a valid page which unlocks chapters", function () {
            it("returns an array with the ids of the functions to unlock those chapters", function () {
                chapter1.unlockedByPageIds = [page1.id];
                chapter2.unlockedByPageIds = [page1.id];
                var result = chapterFunctions.getChapterUnlockChainFunctionIds(page1, authoringStory);
                var expectedFunctionId1 = chapterFunctions.makeChapterChainFunctionId(chapter1.id);
                var expectedFunctionId2 = chapterFunctions.makeChapterChainFunctionId(chapter2.id);

                result.length.should.equal(2);
                console.log(result);

                result.contains(expectedFunctionId1).should.equal(true);
                result.contains(expectedFunctionId2).should.equal(true);
            });
        });

        context("when passed an invalid page", function () {
            it("throws an exception when page.id is undefined", function () {
                expect(function () {
                    chapterFunctions.getChapterUnlockChainFunctionIds({id: undefined}, authoringStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("throws an exception when page is undefined", function () {
                expect(function () {
                    chapterFunctions.getChapterUnlockChainFunctionIds(undefined, authoringStory);
                }).to.throw(errors.SchemaConversionError);
            });
        });
    });

    describe("createChapterMembershipCondition", function () {
        context("when passed a valid page", function () {
            context("with a story with no chapters", function () {
                beforeEach(function () {
                    authoringStory.chapters = [];
                });

                it("returns undefined", function () {
                    var result = chapterFunctions.createChapterMembershipCondition(page1, readingStory, authoringStory);

                    should.equal(result, undefined);
                });

                it("does not add any conditions to the reading story", function () {
                    var initialCountOfConditions = readingStory.conditions.length;
                    chapterFunctions.createChapterMembershipCondition(page1, readingStory, authoringStory);
                    var currentCountOfConditions = readingStory.conditions.length;

                    currentCountOfConditions.should.equal(initialCountOfConditions);
                });
            });

            context("with a a story with chapters", function () {
                context("with a page which unlocks no chapters", function () {
                    it("returns undefined", function () {
                        var result = chapterFunctions.createChapterMembershipCondition(page1, readingStory, authoringStory);

                        should.equal(result, undefined);
                    });

                    it("does not add any conditions to the reading story", function () {
                        var initialCountOfConditions = readingStory.conditions.length;
                        chapterFunctions.createChapterMembershipCondition(page1, readingStory, authoringStory);
                        var currentCountOfConditions = readingStory.conditions.length;

                        currentCountOfConditions.should.equal(initialCountOfConditions);
                    });
                });

                context("with a page which unlocks chapters", function () {
                    beforeEach(function () {
                        chapter1.pageIds = ["p1"];
                        chapter2.pageIds = ["p1", "p2"];
                    });

                    it("returns the id of the new conditions", function () {
                        var id = chapterFunctions.createChapterMembershipCondition(page1, readingStory, authoringStory);

                        id.should.not.equal(undefined);
                    });

                    it("returns a unique id", function () {
                        var id1 = chapterFunctions.createChapterMembershipCondition(page1, readingStory, authoringStory);
                        var id2 = chapterFunctions.createChapterMembershipCondition(page2, readingStory, authoringStory);
                        id1.should.not.equal(id2);
                    });

                    it("adds the condition to the reading story", function () {
                        var id = chapterFunctions.createChapterMembershipCondition(page1, readingStory, authoringStory);
                        readingStory.conditions.getById(id).should.not.equal(undefined);
                    });

                    it("creates a conditional or condition", function () {
                        var id = chapterFunctions.createChapterMembershipCondition(page1, readingStory, authoringStory);
                        var createdCondition = readingStory.conditions.getById(id);

                        var expectedSubCondition1 = chapterFunctions.makeChapterUnlockedVariableId(chapter1.id);
                        var expectedSubCondition2 = chapterFunctions.makeChapterUnlockedVariableId(chapter2.id);

                        createdCondition.type.should.equal("logical");
                        createdCondition.operand.should.equal("OR");
                        createdCondition.conditions.length.should.equal(2);
                        createdCondition.conditions.contains(expectedSubCondition1);
                        createdCondition.conditions.contains(expectedSubCondition2);
                    });
                });
            });
        });

        context("when passed an invalid page", function () {
            it("throws an exception when page.id is undefined", function () {
                expect(function () {
                    chapterFunctions.createChapterMembershipCondition({id: undefined}, readingStory, authoringStory);
                }).to.throw(errors.SchemaConversionError);
            });
            it("throws an exception when page is undefined", function () {
                expect(function () {
                    chapterFunctions.createChapterMembershipCondition(undefined, readingStory, authoringStory);
                }).to.throw(errors.SchemaConversionError);
            });
        });
    });
});


