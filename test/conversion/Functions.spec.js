//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

var functionFunctions = require('../../conversion/Functions');
var errors = require("../../conversion/SchemaConversionErrors");

var factories = require('../utils/testing-factories');

describe("Condition functions", function () {
    var readingStory;

    beforeEach(function () {
        readingStory = factories.basicReadingStory("s1", "Story 1");
    });

    describe("createSetFunction method", function () {
        context("when passed valid data", function () {
            it("returns the ID of the new condition", function () {
                var id = functionFunctions.createSetFunction("id", "v1", "value", ["c1", "c2"], readingStory);
                id.should.not.equal(undefined);
            });

            it("creates conditions with a unique IDs", function () {
                var id1 = functionFunctions.createSetFunction("id1", "v1", "value", ["c1", "c2"], readingStory);
                var id2 = functionFunctions.createSetFunction("id2", "v1", "value", ["c1", "c2"], readingStory);

                id1.should.not.equal(id2);
            });

            it("throws an error if it tries to create multiple conditions with the same id", function () {
                functionFunctions.createSetFunction("id", "v1", "value", ["c1", "c2"], readingStory);

                expect(function () {
                    functionFunctions.createSetFunction("id", "v1", "value", ["c1", "c2"], readingStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("adds the condition to the reading story condition list", function () {
                var id = functionFunctions.createSetFunction("id", "v1", "value", ["c1", "c2"], readingStory);
                readingStory.functions.getById(id).should.not.equal(undefined);
            });

            it("creates set function with the passed condition IDs", function () {
                var id = functionFunctions.createSetFunction("id", "v1", "value", ["c1", "c2"], readingStory);
                var createdFunction = readingStory.functions.getById(id);

                createdFunction.id.should.equal("id");
                createdFunction.type.should.equal("set");
                createdFunction.variable.should.equal("v1");
                createdFunction.value.should.equal("value");
                createdFunction.conditions.contains("c1").should.equal(true);
                createdFunction.conditions.contains("c2").should.equal(true);
            })
        });

        context("when passed invalid data", function () {
            it("should throw an exception if id is undefined", function () {
                expect(function () {
                    functionFunctions.createSetFunction(undefined, "v1", "value", ["c1", "c2"], readingStory);
                }).to.throw(errors.SchemaConversionError);
            });
        });
    });

    describe("createChainFunction method", function () {
        context("when passed valid data", function () {
            it("returns the ID of the new condition", function () {
                var id = functionFunctions.createChainFunction("id", ["c1", "c2"], ["f1","f2"], readingStory);
                id.should.not.equal(undefined);
            });

            it("creates conditions with a unique IDs", function () {
                var id1 = functionFunctions.createChainFunction("id1", ["c1", "c2"], ["f1","f2"], readingStory);
                var id2 = functionFunctions.createChainFunction("id2", ["c1", "c2"], ["f1","f2"], readingStory);

                id1.should.not.equal(id2);
            });

            it("throws an error if it tries to create multiple conditions with the same id", function () {
                functionFunctions.createChainFunction("id", ["c1", "c2"], ["f1","f2"], readingStory);

                expect(function () {
                    functionFunctions.createChainFunction("id", ["c1", "c2"], ["f1","f2"], readingStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("adds the condition to the reading story condition list", function () {
                var id = functionFunctions.createChainFunction("id", ["c1", "c2"], ["f1","f2"], readingStory);
                readingStory.functions.getById(id).should.not.equal(undefined);
            });

            it("creates chain function with the passed condition IDs", function () {
                var id = functionFunctions.createChainFunction("id", ["c1", "c2"], ["f1","f2"], readingStory);
                var createdFunction = readingStory.functions.getById(id);

                createdFunction.id.should.equal("id");
                createdFunction.type.should.equal("chain");
                createdFunction.conditions.contains("c1").should.equal(true);
                createdFunction.conditions.contains("c2").should.equal(true);
                createdFunction.functions.contains("f1").should.equal(true);
                createdFunction.functions.contains("f2").should.equal(true);
            })
        });

        context("when passed invalid data", function () {
            it("should throw an exception if id is undefined", function () {
                expect(function () {
                    functionFunctions.createChainFunction(undefined, ["c1", "c2"], ["f1","f2"], readingStory);
                }).to.throw(errors.SchemaConversionError);
            });
        });
    });

    
});
