//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

var mongoose = require("mongoose");
var CoreSchema = require('../../models/coreschema');

// Misc requires
var fs = require('fs');

//Require the dev-dependencies
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../../server');
var should = chai.should();
var expect = chai.expect;


chai.use(chaiHttp);

// Setup - Empty the database before each test
describe('Stories', function () {
    beforeEach(function (done) {
        CoreSchema.Story.remove({}, function (err) {
            done();
        });
    });


    /*
     * Test the /GET route
     */
    describe('/GET story', function () {
        it('it should GET all the stories', function (done) {
            chai.request(server)
                .get('/storyplaces/story')
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(0);
                    done();
                });
        });
    });

    /*
     * Test the /POST route
     */
    describe('/POST empty story', function () {
        it('it should not POST an empty story', function (done) {
            var story = {}
            chai.request(server)
                .post('/storyplaces/story')
                .set("Content-Type", "application/json")
                .set("X-Auth-Token", "thisisadefaultpass")
                .send(story)
                .end(function (err, res) {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    res.body.error.should.equal('Unable To save story');
                    done();
                });
        });

    });

    describe('/POST valid story', function () {
        it('it should POST a valid story', function (done) {
            var story = JSON.parse(fs.readFileSync('test/resources/the_destitute_and_the_alien.json'));
            chai.request(server)
                .post('/storyplaces/story')
                .set("Content-Type", "application/json")
                .set("X-Auth-Token", "thisisadefaultpass")
                .send(story)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Story created!');
                    CoreSchema.Story.findOne({'name': 'The Destitute and The Alien'}, function (err, res) {
                        expect(res).to.not.null;
                        done();
                    });
                });
        });

    });

    describe('/POST story approve then /GET/:id story', function () {
        it('it should retrieve a POSTed story', function (done) {
            var story = JSON.parse(fs.readFileSync('test/resources/the_destitute_and_the_alien.json'));
            chai.request(server)
                .post('/storyplaces/story')
                .set("Content-Type", "application/json")
                .set("X-Auth-Token", "thisisadefaultpass")
                .send(story)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Story created!');

                    CoreSchema.Story.findOne({'name': 'The Destitute and The Alien'}, (err, res) => {
                        let id = res._id;

                        CoreSchema.Story.findByIdAndUpdate(id, {$set: {publishState: "published"}}, {
                            new: true,
                            runValidators: true
                        }, function (err, story) {
                            CoreSchema.Story.findOne({'name': 'The Destitute and The Alien'}, (err, res) => {
                                let id = res._id;
                                chai.request(server)
                                    .get('/storyplaces/story/' + id)
                                    .end(function (err, res) {
                                        res.should.have.status(200);
                                        res.body.should.be.a('object');
                                        res.body.name.should.eql('The Destitute and The Alien');
                                        done();
                                    });
                            });
                        });

                    });
                });

        });

    });
});