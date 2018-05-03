"use strict";

let errors = require('./SchemaConversionErrors');
let utils = require('./Utils');

exports.addAdvancedLocations = addAdvancedLocations;

function convertLocation(advLocation) {
    utils.validateId(advLocation.id);

    if (!advLocation.lat || advLocation.lat < -90 || advLocation.lat > 90) {
        throw new errors.SchemaConversionError("Invalid latitude found");
    }

    if (!advLocation.long || advLocation.long < -180 || advLocation.long > 180) {
        throw new errors.SchemaConversionError("Please enter a valid longitude");
    }

    if (!advLocation.radius || advLocation.radius < 0 || advLocation.radius > 2000) {
        throw new errors.SchemaConversionError("Please enter a valid radius");
    }

    return {
        id: advLocation.id,
        lat: advLocation.lat,
        lon: advLocation.long,
        type: "circle",
        radius: advLocation.radius,
    }
}

function addAdvancedLocations(readingStory, authoringStory) {
    if (!authoringStory.advancedLocations) {
        return;
    }

    authoringStory.advancedLocations.forEach(advLocation => {
        readingStory.locations.push(convertLocation(advLocation));
    });
}