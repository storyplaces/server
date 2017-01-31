/*
 * ------------
 * StoryPlaces
 * ------------
 * This application was developed as part of the Leverhulme Trust funded
 * StoryPlaces Project. For more information, please visit storyplaces.soton.ac.uk
 * Copyright (c) 2017 University of Southampton
 *
 * David Millard, dem.soton.ac.uk
 * Andy Day, a.r.day.soton.ac.uk
 * Kevin Puplett, k.e.puplett.soton.ac.uk
 * Charlie Hargood, chargood.bournemouth.ac.uk
 * David Pepper, d.pepper.soton.ac.uk
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * - Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * - The name of the University of Southampton nor the name of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE ABOVE COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

var mongoose = require("mongoose");
var AuthoringSchema = require('../models/authoringSchema');

// Misc requires
var fs = require('fs');

//Require the dev-dependencies
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();

chai.use(chaiHttp);

// Setup - Empty the database before each test
describe('AuthoringStories', function () {
    beforeEach(function (done) {
        AuthoringSchema.AuthoringUser.remove({}, function (err) {
            done();
        });
    });


    /*
     * Test the /GET route
     */
    describe('/GET authoringUser', function () {
        it('it should GET all the authoringUsers', function (done) {
            chai.request(server)
                .get('/storyplaces/authoring/user')
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
    describe('/POST empty user', function () {
        it('it should not POST an empty user', function (done) {
            var story = {}
            chai.request(server)
                .post('/storyplaces/authoring/user')
                .set("Content-Type", "application/json")
                .set("X-Auth-Token", "thisisadefaultpass")
                .send(story)
                .end(function (err, res) {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    res.body.error.should.equal('Unable To save authoring user');
                    done();
                });
        });

    });

    describe('/POST valid user', function () {
        it('it should POST a valid story', function (done) {
            var authoringUser = JSON.parse(fs.readFileSync('test/resources/sample_authoring_user.json'));
            chai.request(server)
                .post('/storyplaces/authoring/user')
                .set("Content-Type", "application/json")
                .set("X-Auth-Token", "thisisadefaultpass")
                .send(authoringUser)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Authoring User created!');
                    AuthoringSchema.AuthoringUser.findOne({'name': 'Testy McTest'}, function (err, res) {
                        res.should.not.be.null;
                        res.should.have.property('name', 'Testy McTest');
                        res.should.have.property('email', 'test@content.com');
                        res.should.have.property('bio', 'Born and died in 2017');
                        res.should.have.property('role', 'writer');
                        done();
                    });
                });
        });

    });

    describe('/POST authoringUser then /GET/:id authoringUser', function () {
        it('it should retrieve a POSTed authoringUser', function (done) {
            var authoringUser = JSON.parse(fs.readFileSync('test/resources/sample_authoring_user.json'));
            chai.request(server)
                .post('/storyplaces/authoring/user')
                .set("Content-Type", "application/json")
                .set("X-Auth-Token", "thisisadefaultpass")
                .send(authoringUser)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Authoring User created!');
                    AuthoringSchema.AuthoringUser.findOne({'name': 'Testy McTest'}, function (err, res) {
                        res.should.not.be.null;
                        chai.request(server)
                            .get('/storyplaces/authoring/user/' + res._id)
                            .end(function (err, res) {
                                res.should.have.status(200);
                                res.body.should.be.a('object');
                                res.body.should.include(authoringUser);
                                done();
                            });
                    });

                });

        });

    });
});