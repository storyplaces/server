/**readingStory
 * Created by kep1u13 on 16/03/2017.
 */

"use strict";

exports.createReadingStory = createReadingStory;

var moment = require("moment");
let markdown = require('./Markdown');

function createReadingStory(authoringStory, readingState, authorName) {
    return {
        name: authoringStory.title,
        description: markdown.render(authoringStory.description),
        author: authorName,
        audience: authoringStory.audience,
        tags: authoringStory.tags.length != 0 ? authoringStory.tags : [],
        publishState: readingState,
        publishDate: moment().format("dddd, MMMM Do YYYY, h:mm:ss a"),
        locations: [],
        conditions: [],
        functions: [],
        pages: [],
        cachedMediaIds: [],
        storyOptions: {
            logLocations: authoringStory.logLocations
        }
    };
}