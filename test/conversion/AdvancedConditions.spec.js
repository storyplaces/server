//During the test the env letiable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let should = chai.should();
let expect = chai.expect;

let advancedConditionFunctions = require('../../conversion/AdvancedConditions');
let errors = require("../../conversion/SchemaConversionErrors");

require('../utils/testing-utils');
let factories = require('../utils/testing-factories');

describe("Advanced condition conversion functions", function () {
    let authoringStory;
    let readingStory;

    beforeEach(function () {
        authoringStory = {advancedConditions: []};
        readingStory = {conditions: []};
    });

    describe("addAdvancedConditions", () => {
        context("given an empty set of advanced conditions", () => {
            it("will return and empty set of conditions", () => {
                advancedConditionFunctions.addAdvancedConditions(readingStory, authoringStory);

                readingStory.conditions.should.be.a('array');
                readingStory.conditions.length.should.be.eql(0);
            });
        });

        context("given a set of valid advanced conditions", () => {
            it("will return a valid time range condition", () => {
                let condition = factories.advancedTimeRangeCondition("abc123", "var123", "12:12", "13:13");
                authoringStory.advancedConditions.push(condition);

                advancedConditionFunctions.addAdvancedConditions(readingStory, authoringStory);

                readingStory.conditions.should.be.a('array');
                readingStory.conditions.length.should.be.eql(1);
                readingStory.conditions[0].id.should.be.eql('abc123');
                readingStory.conditions[0].type.should.be.eql('timerange');
                readingStory.conditions[0].variable.should.be.eql('var123');
                readingStory.conditions[0].start.should.be.eql('12:12');
                readingStory.conditions[0].end.should.be.eql('13:13');
            });

            it("will return a valid comparison condition", () => {
                let condition = factories.advancedComparisonCondition("abc123", "var123", "var456", "String", "Integer", "==");
                authoringStory.advancedConditions.push(condition);

                advancedConditionFunctions.addAdvancedConditions(readingStory, authoringStory);

                readingStory.conditions.should.be.a('array');
                readingStory.conditions.length.should.be.eql(1);

                readingStory.conditions[0].id.should.be.eql('abc123');
                readingStory.conditions[0].type.should.be.eql('comparison');
                readingStory.conditions[0].a.should.be.eql('var123');
                readingStory.conditions[0].b.should.be.eql('var456');
                readingStory.conditions[0].aType.should.be.eql('String');
                readingStory.conditions[0].bType.should.be.eql('Integer');
                readingStory.conditions[0].operand.should.be.eql('==');
            });

            it("will return a valid check condition", () => {
                let condition = factories.advancedCheckCondition("abc123", "var123");
                authoringStory.advancedConditions.push(condition);

                advancedConditionFunctions.addAdvancedConditions(readingStory, authoringStory);

                readingStory.conditions.should.be.a('array');
                readingStory.conditions.length.should.be.eql(1);

                readingStory.conditions[0].id.should.be.eql('abc123');
                readingStory.conditions[0].type.should.be.eql('check');
                readingStory.conditions[0].variable.should.be.eql('var123');
            });

            it("will return a valid location condition", () => {
                let condition = factories.advancedLocationCondition("abc123", "loc123");
                authoringStory.advancedConditions.push(condition);

                advancedConditionFunctions.addAdvancedConditions(readingStory, authoringStory);

                readingStory.conditions.should.be.a('array');
                readingStory.conditions.length.should.be.eql(1);

                readingStory.conditions[0].id.should.be.eql('abc123');
                readingStory.conditions[0].type.should.be.eql('location');
                readingStory.conditions[0].location.should.be.eql('loc123');
            });

            it("will return a valid logical condition", () => {
                let condition = factories.advancedLogicalCondition("abc123", "==", ["def456", "ghi789"]);
                authoringStory.advancedConditions.push(condition);

                advancedConditionFunctions.addAdvancedConditions(readingStory, authoringStory);

                readingStory.conditions.should.be.a('array');
                readingStory.conditions.length.should.be.eql(1);

                readingStory.conditions[0].id.should.be.eql('abc123');
                readingStory.conditions[0].type.should.be.eql('logical');
                readingStory.conditions[0].operand.should.be.eql('==');
                readingStory.conditions[0].conditions.should.be.eql(['def456', 'ghi789']);
            });

            it("will return a valid time passed condition", () => {
                let condition = factories.advancedTimePassedCondition("abc123", "def456", 12);
                authoringStory.advancedConditions.push(condition);

                advancedConditionFunctions.addAdvancedConditions(readingStory, authoringStory);

                readingStory.conditions.should.be.a('array');
                readingStory.conditions.length.should.be.eql(1);

                readingStory.conditions[0].id.should.be.eql('abc123');
                readingStory.conditions[0].type.should.be.eql('timepassed');
                readingStory.conditions[0].variable.should.be.eql('def456');
                readingStory.conditions[0].minutes.should.be.eql(12);
            });
        });

        context("given a set of invalid advanced conditions", () => {
            it("will thrown an error if a bad condition id is passed", () => {
                let condition = factories.advancedTimePassedCondition("abc+123", "def456", 12);
                authoringStory.advancedConditions.push(condition);

                expect(() => {
                    advancedConditionFunctions.addAdvancedConditions(readingStory, authoringStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("will thrown an error if a bad variable id is passed", () => {
                let condition = factories.advancedTimePassedCondition("abc123", "def+456", 12);
                authoringStory.advancedConditions.push(condition);

                expect(() => {
                    advancedConditionFunctions.addAdvancedConditions(readingStory, authoringStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("will thrown an error if a bad variableA id is passed", () => {
                let condition = factories.advancedComparisonCondition("abc123", "var+123", "var456", "String", "Integer", "==");
                authoringStory.advancedConditions.push(condition);

                expect(() => {
                    advancedConditionFunctions.addAdvancedConditions(readingStory, authoringStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("will thrown an error if a bad variableB id is passed", () => {
                let condition = factories.advancedComparisonCondition("abc123", "var123", "var+456", "String", "Integer", "==");
                authoringStory.advancedConditions.push(condition);

                expect(() => {
                    advancedConditionFunctions.addAdvancedConditions(readingStory, authoringStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("will thrown an error if a bad variableAType id is passed", () => {
                let condition = factories.advancedComparisonCondition("abc123", "var123", "var456", "NotAType", "Integer", "==");
                authoringStory.advancedConditions.push(condition);

                expect(() => {
                    advancedConditionFunctions.addAdvancedConditions(readingStory, authoringStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("will thrown an error if a bad variableBType id is passed", () => {
                let condition = factories.advancedComparisonCondition("abc123", "var123", "var456", "String", "NotAType", "==");
                authoringStory.advancedConditions.push(condition);

                expect(() => {
                    advancedConditionFunctions.addAdvancedConditions(readingStory, authoringStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("will thrown an error if a bad operand is passed", () => {
                let condition = factories.advancedComparisonCondition("abc123", "var123", "var+456", "String", "Integer", "NotAnOperand");
                authoringStory.advancedConditions.push(condition);

                expect(() => {
                    advancedConditionFunctions.addAdvancedConditions(readingStory, authoringStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("will thrown an error if a bad condition id is passed", () => {
                let condition = factories.advancedLogicalCondition("abc123", "==", ["def+456", "ghi789"]);
                authoringStory.advancedConditions.push(condition);

                expect(() => {
                    advancedConditionFunctions.addAdvancedConditions(readingStory, authoringStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("will thrown an error if a bad location id is passed", () => {
                let condition = factories.advancedLocationCondition("abc123", "loc+123");
                authoringStory.advancedConditions.push(condition);

                expect(() => {
                    advancedConditionFunctions.addAdvancedConditions(readingStory, authoringStory);
                }).to.throw(errors.SchemaConversionError);
            });


        });
    });
});


