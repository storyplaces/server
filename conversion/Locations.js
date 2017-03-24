/**
 * Created by kep1u13 on 16/03/2017.
 */

"use strict";

exports.createLocation = createLocation;
exports.createLocationCondition = createLocationCondition;
exports.makeLocationConditionId = makeLocationConditionId;

var errors = require('./SchemaConversionErrors');

function createLocation(locationId, authoringStory, readingStory) {
    if (!locationId) {
        return undefined
    }

    var location = findLocationFromAuthoringStory(locationId, authoringStory);

    if (!location) {
        return undefined
    }

    switch (location.type) {
        case "circle":
            return copyCircleLocation(location, readingStory);
        default:
            throw new errors.SchemaConversionError("Unknown location type");
    }
}

function findLocationFromAuthoringStory(locationId, authoringStory) {
    return authoringStory.locations.filter(function (location) {
        return location.id == locationId
    }).pop();
}

function copyCircleLocation(location, readingStory) {
    var existingLocations = readingStory.locations.filter(function (readingLocation) {
        if (readingLocation.type != "circle") {
            return false;
        }

        var latMatches = readingLocation.lat == location.lat;
        var lonMatches = readingLocation.lon == location.long;
        var radiusMatches = readingLocation.radius == location.radius;
        return latMatches && lonMatches && radiusMatches;
    });

    if (existingLocations.length != 0) {
        return existingLocations.pop().id;
    }

    readingStory.locations.push(makeLocation(location));

    return location.id;
}

function makeLocation(location) {
    return {
        id: location.id,
        lat: location.lat,
        lon: location.long,
        radius: location.radius,
        type: "circle"
    };
}

function createLocationCondition(location, readingStory) {
    readingStory.conditions.push({
        id: makeLocationConditionId(location.id),
        location: location.id,
        bool: "true",
        type: "location"
    });
}

function makeLocationConditionId(locationId) {
    if (!locationId) {
        return undefined;
    }

    return "location-" + locationId;
}