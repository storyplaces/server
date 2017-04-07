/**readingStory
 * Created by kep1u13 on 16/03/2017.
 */

"use strict";

exports.createReadingStory = createReadingStory;

let AuthoringSchema = require('../models/authoringSchema');
var moment = require("moment");

function createReadingStory(authoringStory, readingState, authorName) {
    return {
        name: authoringStory.title,
        description: authoringStory.description,
        author: authorName,
        audience: authoringStory.audience,
        tags: authoringStory.tags.length != 0 ? authoringStory.tags : ["untagged"],
        publishState: readingState,
        publishDate: moment().format("dddd, MMMM Do YYYY, h:mm:ss a"),
        locations: [],
        conditions: [],
        functions: [],
        pages: []
    };
}