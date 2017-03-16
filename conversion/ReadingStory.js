/**
 * Created by kep1u13 on 16/03/2017.
 */

"use strict";

exports.createReadingStory = createReadingStory;

function createReadingStory(authoringStory) {
    return {
        name: authoringStory.title,
        description: authoringStory.description,
        audience: authoringStory.audience,
        tags: authoringStory.tags.length != 0 ? authoringStory.tags : ["untagged"],
        publishState: "pending",
        locations: [],
        conditions: [],
        functions: [],
        pages: []
    };
}