//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var chai = require('chai');
var should = chai.should();

var pageFunctions = require('../../conversion/Pages');

describe("Pages conversion", function () {
    describe("processPage method", function () {
        xit("process page method needs tests", function () {

        });
    });

    describe("makePageReadConditionId", function () {
        it("will return a condition id which is different to the page id", function () {
            var id1 = "id-1";
            var result1 = pageFunctions.makePageReadConditionId(id1);
            result1.should.not.equal(id1);
        });

        it("will return a new, unique id when given a page id", function () {
            var id1 = "id-1";
            var id2 = "id-2";

            var result1 = pageFunctions.makePageReadConditionId(id1);
            var result2 = pageFunctions.makePageReadConditionId(id2);

            result1.should.not.equal(result2);
        });
    });
});