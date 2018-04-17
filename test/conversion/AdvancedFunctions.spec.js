//During the test the env letiable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let should = chai.should();
let expect = chai.expect;

let advancedFunctions = require('../../conversion/AdvancedFunctions');
let pageFunctions = require('../../conversion/Pages');
let errors = require("../../conversion/SchemaConversionErrors");

require('../utils/testing-utils');
let factories = require('../utils/testing-factories');

describe("Advanced function conversion functions", function () {
    let authoringStory;
    let readingStory;

    beforeEach(function () {
        authoringStory = {advancedFunctions: []};
        readingStory = {functions: []};
    });

    describe("addAdvancedFunctions", () => {
        context("given an authoring story with no advanced functions", () => {
            it("does not error and returns an reading story with an empty set of locations", () => {
                advancedFunctions.addAdvancedFunctions(readingStory, authoringStory);

                readingStory.functions.should.be.a('array');
                readingStory.functions.length.should.be.eql(0);
            });
        });

        context("given an authoring story with a valid set of functions", () => {
            it("will return a set function", () => {
                let func = factories.advancedSetFunction("abc123", "var123", "12", ["cond123"]);

                authoringStory.advancedFunctions.push(func);

                advancedFunctions.addAdvancedFunctions(readingStory, authoringStory);

                readingStory.functions.should.be.a('array');
                readingStory.functions.length.should.be.eql(1);

                readingStory.functions[0].id.should.be.eql('abc123');
                readingStory.functions[0].type.should.be.eql('set');
                readingStory.functions[0].variable.should.be.eql('var123');
                readingStory.functions[0].value.should.be.eql('12');
                readingStory.functions[0].conditions.should.be.eql(['cond123']);
            });

            it("will return a set time stamp function", () => {
                let func = factories.advancedSetTimeStampFunction("abc123", "var123", ["cond123"]);

                authoringStory.advancedFunctions.push(func);

                advancedFunctions.addAdvancedFunctions(readingStory, authoringStory);

                readingStory.functions.should.be.a('array');
                readingStory.functions.length.should.be.eql(1);

                readingStory.functions[0].id.should.be.eql('abc123');
                readingStory.functions[0].type.should.be.eql('settimestamp');
                readingStory.functions[0].variable.should.be.eql('var123');
                readingStory.functions[0].conditions.should.be.eql(['cond123']);
            });

            it("will return an increment function", () => {
                let func = factories.advancedIncrementFunction("abc123", "var123", "12", ["cond123"]);

                authoringStory.advancedFunctions.push(func);

                advancedFunctions.addAdvancedFunctions(readingStory, authoringStory);

                readingStory.functions.should.be.a('array');
                readingStory.functions.length.should.be.eql(1);

                readingStory.functions[0].id.should.be.eql('abc123');
                readingStory.functions[0].type.should.be.eql('increment');
                readingStory.functions[0].variable.should.be.eql('var123');
                readingStory.functions[0].value.should.be.eql('12');
                readingStory.functions[0].conditions.should.be.eql(['cond123']);
            });

            it("will return a chain function", () => {
                let func = factories.advancedChainFunction("abc123", ["chain123", "chain456"], ["cond123"]);

                authoringStory.advancedFunctions.push(func);

                advancedFunctions.addAdvancedFunctions(readingStory, authoringStory);

                readingStory.functions.should.be.a('array');
                readingStory.functions.length.should.be.eql(1);

                readingStory.functions[0].id.should.be.eql('abc123');
                readingStory.functions[0].type.should.be.eql('chain');
                readingStory.functions[0].functions.should.be.eql(['chain123', 'chain456']);
                readingStory.functions[0].conditions.should.be.eql(['cond123']);
            });

            it("will return several functions", () => {
                let func1 = factories.advancedIncrementFunction("abc123", "var123", "12", ["cond123"]);
                let func2 = factories.advancedChainFunction("abc456", ["chain123", "chain456"], ["cond123"]);

                authoringStory.advancedFunctions.push(func1, func2);

                advancedFunctions.addAdvancedFunctions(readingStory, authoringStory);

                readingStory.functions.should.be.a('array');
                readingStory.functions.length.should.be.eql(2);

                readingStory.functions[0].id.should.be.eql('abc123');
                readingStory.functions[1].id.should.be.eql('abc456');
            });
        });

        context("given an authoring story with an invalid functions", () => {
            it("will throw if a badly formatted function id is passed", () => {
                let func = factories.advancedIncrementFunction("abc+123", "var123", "12", ["cond123"]);
                authoringStory.advancedFunctions.push(func);

                expect(() => {
                    advancedFunctions.addAdvancedFunctions(readingStory, authoringStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("will throw if a badly formatted variable id is passed", () => {
                let func = factories.advancedIncrementFunction("abc123", "var+123", "12", ["cond123"]);
                authoringStory.advancedFunctions.push(func);

                expect(() => {
                    advancedFunctions.addAdvancedFunctions(readingStory, authoringStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("will throw if a badly formatted chain function id is passed", () => {
                let func = factories.advancedChainFunction("abc456", ["chain123", "chain+456"], ["cond123"]);
                authoringStory.advancedFunctions.push(func);

                expect(() => {
                    advancedFunctions.addAdvancedFunctions(readingStory, authoringStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("will throw if a badly formatted condition id is passed", () => {
                let func = factories.advancedChainFunction("abc456", ["chain123", "chain456"], ["cond+123"]);
                authoringStory.advancedFunctions.push(func);

                expect(() => {
                    advancedFunctions.addAdvancedFunctions(readingStory, authoringStory);
                }).to.throw(errors.SchemaConversionError);
            });
        });
    });
});


