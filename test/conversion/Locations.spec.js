//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

var locationFunctions = require('../../conversion/Locations');

require('../utils/testing-utils');

describe("Locations conversion", function () {
    describe("createLocation", function () {
        var authoringStory;
        var readingStory;

        beforeEach(function () {
            authoringStory = {
                locations: [
                    {id: "l-good", lat: 1, long: 2, radius: 3, type: "circle"},
                    {id: "l-match", lat: 1, long: 2, radius: 3, type: "circle"},
                    {id: "l-notMatch1", lat: 4, long: 2, radius: 3, type: "circle"},
                    {id: "l-notMatch2", lat: 1, long: 4, radius: 3, type: "circle"},
                    {id: "l-notMatch3", lat: 1, long: 2, radius: 4, type: "circle"},
                    {id: "l-badType", lat: 5, long: 6, radius: 7, type: "unknown"}
                ]
            };

            readingStory = {conditions: [], locations: []};
        });


        it("creates a new reading schema location based upon an authoring schema location and returns the new id", function () {
            var goodId = locationFunctions.createLocation("l-good", authoringStory, readingStory);

            goodId.should.not.equal(undefined);

            readingStory.locations.length.should.equal(1);

            testLocation(readingStory.locations.getById(goodId), goodId, 1, 2, 3);
        });

        it("if there is a duplicate reading schema location will return the id based upon an authoring schema location", function () {
            var goodId = locationFunctions.createLocation("l-good", authoringStory, readingStory);
            var matchId = locationFunctions.createLocation("l-match", authoringStory, readingStory);

            goodId.should.not.equal(undefined);
            matchId.should.equal(goodId);

            readingStory.locations.length.should.equal(1);

            testLocation(readingStory.locations.getById(goodId), goodId, 1, 2, 3);
        });

        it("will create a new location if it doesn't match an existing one", function () {
            var goodId = locationFunctions.createLocation("l-good", authoringStory, readingStory);
            var notMatch1Id = locationFunctions.createLocation("l-notMatch1", authoringStory, readingStory);
            var notMatch2Id = locationFunctions.createLocation("l-notMatch2", authoringStory, readingStory);
            var notMatch3Id = locationFunctions.createLocation("l-notMatch3", authoringStory, readingStory);

            goodId.should.not.equal(undefined);

            notMatch1Id.should.not.equal(undefined);
            notMatch2Id.should.not.equal(undefined);
            notMatch3Id.should.not.equal(undefined);

            notMatch1Id.should.not.equal(goodId);
            notMatch2Id.should.not.equal(goodId);
            notMatch3Id.should.not.equal(goodId);

            readingStory.locations.length.should.equal(4);

            testLocation(readingStory.locations.getById(goodId), goodId, 1, 2, 3);
            testLocation(readingStory.locations.getById(notMatch1Id), notMatch1Id, 4, 2, 3);
            testLocation(readingStory.locations.getById(notMatch2Id), notMatch2Id, 1, 4, 3);
            testLocation(readingStory.locations.getById(notMatch3Id), notMatch3Id, 1, 2, 4);
        });

        it("will return undefined if the authoring schema location does not exist", function () {
            var result = locationFunctions.createLocation("not-a-location", authoringStory, readingStory);
            should.equal(result, undefined);
        });

        it("will return undefined if the passed locationId is undefined", function () {
            var result = locationFunctions.createLocation(undefined, authoringStory, readingStory);
            should.equal(result, undefined);
        });

        it("will thrown an error if the authoring schema type does not exist", function () {
            expect(function () {
                locationFunctions.createLocation("l-badType", authoringStory, readingStory)
            }).to.throw();
        });

        function testLocation(location, id, latitude, longitude, radius) {
            location.id.should.equal(id);
            location.lat.should.equal(latitude);
            location.lon.should.equal(longitude);
            location.radius.should.equal(radius);
            location.type.should.equal("circle");
        }
    });

    describe("createLocationCondition", function () {
        context("when passed a location", function () {
            it("creates a location condition in the passed reading", function () {
                var authoringLocation = {id: "id1"};
                var readingStory = {conditions: []};
                locationFunctions.createLocationCondition(authoringLocation, readingStory);

                var result = readingStory.conditions[0];

                var expectedConditionId = locationFunctions.makeLocationConditionId(authoringLocation.id);

                result.should.eql({
                    id: expectedConditionId,
                    location: authoringLocation.id,
                    bool: 'true',
                    type: 'location'
                });
            });
        });
    });

    describe("makeLocationConditionId", function () {
        it("will return a condition id which is different to the location id", function () {
            var id1 = "id-1";
            var result1 = locationFunctions.makeLocationConditionId(id1);
            result1.should.not.equal(id1);
        });

        it("will return a new, unique id when given a location id", function () {
            var id1 = "id-1";
            var id2 = "id-2";

            var result1 = locationFunctions.makeLocationConditionId(id1);
            var result2 = locationFunctions.makeLocationConditionId(id2);

            result1.should.not.equal(result2);
        });
    });

    describe("makeReadingLocationId", function () {
       context("when passed good data", function () {
           it("will return an id", function () {
              var id = locationFunctions.makeReadingLocationId("l1");
              id.should.not.equal(undefined);
           });

           it("will return a unique id", function () {
               var id1 = locationFunctions.makeReadingLocationId("l1");
               var id2 = locationFunctions.makeReadingLocationId("l2");
               id1.should.not.equal(id2);
           });
       });

       context("when passed bad data", function () {
           it("will return undefined when passed a location of undefined", function () {
               var id = locationFunctions.makeReadingLocationId(undefined);
               should.equal(undefined, id);
           });
       });
    });
});


