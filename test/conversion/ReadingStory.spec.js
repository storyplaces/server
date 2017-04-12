//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var chai = require('chai');

var readingStoryFunction = require('../../conversion/ReadingStory');
var utils = require('../utils/testing-utils');
var factories = require('../utils/testing-factories');

require('../utils/testing-utils');

describe("Creating a blank reading story from an authoring story", function () {
    var authoringStory;

    beforeEach(function () {
        authoringStory = factories.basicAuthoringStory("id", "title", "description", "audience", []);
    });

    it("creates a story when the authoring story has tags", function () {
        authoringStory.tags=["tag1", "tag2"];

        var result = readingStoryFunction.createReadingStory(authoringStory, "published");

        result.name.should.equal("title");
        result.description.should.equal("description");
        result.audience.should.equal("audience");
        result.tags.should.eql(["tag1", "tag2"]);
        result.publishState.should.eql("published");
        result.locations.should.eql([]);
        result.conditions.should.eql([]);
        result.functions.should.eql([]);
        result.pages.should.eql([]);
    });

    it("creates a story when the authoring story has no tags", function () {
        authoringStory.tags=[];

        var result = readingStoryFunction.createReadingStory(authoringStory, "pending");

        result.name.should.equal("title");
        result.description.should.equal("description");
        result.audience.should.equal("audience");
        result.tags.should.eql([]);
        result.publishState.should.eql("pending");
        result.locations.should.eql([]);
        result.conditions.should.eql([]);
        result.functions.should.eql([]);
        result.pages.should.eql([]);
    });
});


