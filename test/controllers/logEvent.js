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
var CoreSchema = require('../../models/coreschema');
let AuthoringSchema = require('../../models/authoringSchema');
let jwt = require('../../auth/JwtAuthentication');

// Misc requires
var fs = require('fs');

//Require the dev-dependencies
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../../server');
var should = chai.should();

chai.use(chaiHttp);

// Setup - Empty the database before each test
describe('LogEvent', function () {
    let authHeader;

    beforeEach(() => {
        return CoreSchema.LogEvent.remove({})
            .then(() => {
                return AuthoringSchema.AuthoringUser.remove({})
            })
            .then(() => {
                return new AuthoringSchema.AuthoringUser({
                    email: "test.user@example.local",
                    name: "Test user",
                    bio: "Bio",
                    roles: ["author", "admin"],
                    googleID: "abc123",
                    enabled: true
                })
                    .save()
                    .then(user => {
                        authHeader = "Basic " + jwt.createJWTFromUser(user);
                    });
            })
            ;
    });

    /*
     * Test the /POST route
     */
    describe('/POST valid log event', function () {
        it('it should POST a valid log event', function (done) {
            var logEvent = JSON.parse(fs.readFileSync('test/resources/valid_log_event.json'));
            chai.request(server)
                .post('/storyplaces/logevent')
                .set("Content-Type", "application/json")
                .set("X-Auth-Token", "thisisadefaultpass")
                .send(logEvent)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    CoreSchema.LogEvent.findOne({'user': 'testuser1'}, function (err, res) {
                        res.should.not.be.null;
                        res.should.have.property('user', 'testuser1');
                        res.should.have.property('type', 'playreading');
                        res.should.have.property('date');
                        chai.expect(res.date.getTime()).to.equal(1478784684000);
                        done();
                    });
                });
        });

    });

    /*
     * Test the /GET route
     */
    describe('/GET logEvent with range', function () {
        it('it should GET one logEvent', function (done) {
            var eventlog = JSON.parse(fs.readFileSync('test/resources/valid_log_event.json'));
            chai.request(server)
                .post('/storyplaces/logevent')
                .set("Content-Type", "application/json")
                .set("X-Auth-Token", "thisisadefaultpass")
                .send(eventlog)
                .end(() => {
                    chai.request(server)
                        .get('/storyplaces/authoring/logevent/range/1478784683000/1478784685000')
                        .set("Authorization", authHeader)
                        .end(function (err, res) {
                            console.log(err);
                            res.should.have.status(200);
                            res.body.should.be.a('array');
                            res.body.length.should.be.eql(1);
                            done();
                        });
                });
        });
    });

});