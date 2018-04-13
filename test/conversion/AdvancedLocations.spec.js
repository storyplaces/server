//During the test the env letiable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let should = chai.should();
let expect = chai.expect;

let advancedLocationFunctions = require('../../conversion/AdvancedLocations');
let pageFunctions = require('../../conversion/Pages');
let errors = require("../../conversion/SchemaConversionErrors");

require('../utils/testing-utils');
let factories = require('../utils/testing-factories');

describe("Advanced location conversion functions", function () {
    let authoringStory;
    let readingStory;

    beforeEach(function () {
        authoringStory = {advancedLocations: []};
        readingStory = {locations: []};
    });

    describe("addAdvancedLocations", () => {
        context("given an authoring story with no advanced locations", () => {
            it("does not error and returns an reading story with an empty set of locations", () => {
                advancedLocationFunctions.addAdvancedLocations(readingStory, authoringStory);

                readingStory.locations.should.be.a('array');
                readingStory.locations.length.should.be.eql(0);
            });
        });

        context("given an authoring story with a valid set of locations", () => {
            it("parses the locations into the reading story", () => {
                let location1 = factories.advancedLocation("abc123", 10, 20, 30);
                let location2 = factories.advancedLocation("def456", 40, 50, 60);

                authoringStory.advancedLocations.push(location1, location2);

                advancedLocationFunctions.addAdvancedLocations(readingStory, authoringStory);

                readingStory.locations.should.be.a('array');
                readingStory.locations.length.should.be.eql(2);
            });

            it("creates a valid reading location", () => {
                let location = factories.advancedLocation("abc123", 10, 20, 30);

                authoringStory.advancedLocations.push(location);

                advancedLocationFunctions.addAdvancedLocations(readingStory, authoringStory);
                readingStory.locations.length.should.be.eql(1);

                let readingLocation = readingStory.locations[0];

                readingLocation.id.should.be.eql("abc123");
                readingLocation.lat.should.be.eql(10);
                readingLocation.lon.should.be.eql(20);
                readingLocation.radius.should.be.eql(30);
                readingLocation.type.should.be.eql('circle');
            });
        });

        context("given an authoring story with an invalid location", () => {
            it("will throw an error if the id is missing", () => {
                let location = factories.advancedLocation(undefined, 10, 20, 30);

                authoringStory.advancedLocations.push(location);

                expect(function () {
                    advancedLocationFunctions.addAdvancedLocations(readingStory, authoringStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("will throw an error if the lat is missing", () => {
                let location = factories.advancedLocation("abc123", undefined, 20, 30);

                authoringStory.advancedLocations.push(location);

                expect(function () {
                    advancedLocationFunctions.addAdvancedLocations(readingStory, authoringStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("will throw an error if the lat is too low", () => {
                let location = factories.advancedLocation("abc123", -100, 20, 30);

                authoringStory.advancedLocations.push(location);

                expect(function () {
                    advancedLocationFunctions.addAdvancedLocations(readingStory, authoringStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("will throw an error if the lat is too high", () => {
                let location = factories.advancedLocation("abc123", 100, 20, 30);

                authoringStory.advancedLocations.push(location);

                expect(function () {
                    advancedLocationFunctions.addAdvancedLocations(readingStory, authoringStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("will throw an error if the long is missing", () => {
                let location = factories.advancedLocation("abc123", 10, undefined, 30);

                authoringStory.advancedLocations.push(location);

                expect(function () {
                    advancedLocationFunctions.addAdvancedLocations(readingStory, authoringStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("will throw an error if the long is too low", () => {
                let location = factories.advancedLocation("abc123", 10, -200, 30);

                authoringStory.advancedLocations.push(location);

                expect(function () {
                    advancedLocationFunctions.addAdvancedLocations(readingStory, authoringStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("will throw an error if the long is too high", () => {
                let location = factories.advancedLocation("abc123", 10, 200, 30);

                authoringStory.advancedLocations.push(location);

                expect(function () {
                    advancedLocationFunctions.addAdvancedLocations(readingStory, authoringStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("will throw an error if the radius is missing", () => {
                let location = factories.advancedLocation("abc123", 10, 20, undefined);

                authoringStory.advancedLocations.push(location);

                expect(function () {
                    advancedLocationFunctions.addAdvancedLocations(readingStory, authoringStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("will throw an error if the radius is too low", () => {
                let location = factories.advancedLocation("abc123", 10, 20, -1);

                authoringStory.advancedLocations.push(location);

                expect(function () {
                    advancedLocationFunctions.addAdvancedLocations(readingStory, authoringStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("will throw an error if the radius is too high", () => {
                let location = factories.advancedLocation("abc123", 10, 20, 3000);

                authoringStory.advancedLocations.push(location);

                expect(function () {
                    advancedLocationFunctions.addAdvancedLocations(readingStory, authoringStory);
                }).to.throw(errors.SchemaConversionError);
            });
        });
    });
});


