//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

let markdownFunctions = require('../../conversion/Markdown');

describe("Markdown conversion", function () {
    describe("render method", function () {
        it("renders plain text into a paragraph", () => {
            let html = markdownFunctions.render("This is some text");

            html.should.equal("<p>This is some text</p>\n");
        });

        it("removes images", () => {
            let html = markdownFunctions.render('![alt text](https://somesite.com/image.png "Logo Title Text 1")');

            html.should.equal("<p></p>\n");
        });

        it("removes external links", () => {
           let html = markdownFunctions.render("[link](http://news.bbc.co.uk)");

           html.should.equal("<p></p>\n");
        });

        it("allows iSurvey links", () => {
            let html = markdownFunctions.render('[survey](https://www.isurvey.soton.ac.uk/id "Title text")');

            html.should.equal('<p><a href="https://www.isurvey.soton.ac.uk/id" title="Title text">survey</a></p>\n');
        });

    });
});
