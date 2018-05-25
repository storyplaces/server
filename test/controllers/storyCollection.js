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
var AuthoringSchema = require('../../models/authoringSchema');
var CoreSchema = require('../../models/coreschema');

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
describe('StoryCollection controller', function () {
    let authHeader;

    beforeEach(() => {
        return AuthoringSchema.AuthoringUser.remove({})
            .then(() => {
                return CoreSchema.StoryCollection.remove({});
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
            });
    });


    /*
     * Test the /GET route
     */
    describe('/GET authoring/admin/collection', function () {
        it('it should GET all the authoring/admin/collection', function (done) {
            new CoreSchema.StoryCollection({name: "Collection 1", description: "Description 1", storyIds: ["abc1", "def2"], slug: "slug 1"}).save()
                .then(() => new CoreSchema.StoryCollection({name: "Collection 2", description: "Description 2", storyIds: ["abc1", "def2"], slug: "slug 2"}).save())
                .then(() => {
                    chai.request(server)
                        .get('/storyplaces/authoring/admin/collection')
                        .set("Authorization", authHeader)
                        .end(function (err, res) {
                            res.should.have.status(200);
                            res.body.should.be.a('array');
                            res.body.length.should.be.eql(2);
                            done();
                        });
                });
        });
    });


    /*
 * Test the /GET route
 */
    describe('GET collection', function () {
        it('should GET all the collections for the reading tool', function (done) {
            new CoreSchema.StoryCollection({name: "Collection 1", description: "Description 1", storyIds: ["abc1", "def2"], slug: "slug 1"}).save()
                .then(() => new CoreSchema.StoryCollection({name: "Collection 2", description: "Description 2", storyIds: ["abc1", "def2"], slug: "slug 2"}).save())
                .then(() => {
                    chai.request(server)
                        .get('/storyplaces/collection')
                        .end(function (err, res) {
                            res.should.have.status(200);
                            res.body.should.be.a('array');
                            res.body.length.should.be.eql(2);
                            done();
                        });
                });
        });

        it('should convert markdown to html for the reading tool', function (done) {
            new CoreSchema.StoryCollection({name: "Collection 1", description: "Description 1", storyIds: ["abc1", "def2"], slug: "slug 1"}).save()
                .then(() => {
                    chai.request(server)
                        .get('/storyplaces/collection')
                        .end(function (err, res) {
                            res.should.have.status(200);
                            res.body.should.be.a('array');
                            res.body.length.should.be.eql(1);
                            res.body[0].should.have.property('description','<p>Description 1</p>\n');
                            done();
                        });
                });
        });

        it('should convert markdown to html for the reading tool when getting 1', function (done) {
            new CoreSchema.StoryCollection({name: "Collection 1", description: "Description 1", storyIds: ["abc1", "def2"], slug: "slug 1"}).save()
                .then(storyCollection => storyCollection.id)
                .then(collectionId => {
                    chai.request(server)
                        .get(`/storyplaces/collection/${collectionId}`)
                        .end(function (err, res) {
                            res.should.have.status(200);
                            res.body.should.have.property('description','<p>Description 1</p>\n');
                            done();
                        });
                });
        });
    });

    /*
     * Test the /POST route
     */
    describe('POST empty authoring/admin/collection', function () {
        it('should not POST an empty authoring/admin/collection', function (done) {
            let collection = {}
            chai.request(server)
                .post('/storyplaces/authoring/admin/collection')
                .set("Content-Type", "application/json")
                .set("Authorization", authHeader)
                .send(collection)
                .end(function (err, res) {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    res.body.error.should.equal('Unable To save Story Collection');
                    done();
                });
        });
    });

    describe('POST valid authoring/admin/collection', function () {
        it('it should POST a valid authoring/admin/collection', function (done) {
            let storyCollection = {name: "Collection 1", description: "Description 1", storyIds: ["abc1", "def2"], slug: "slug 1"};
            chai.request(server)
                .post('/storyplaces/authoring/admin/collection')
                .set("Content-Type", "application/json")
                .set("Authorization", authHeader)
                .send(storyCollection)
                .end(function (err, res) {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    CoreSchema.StoryCollection.findOne({'name': 'Collection 1'}, function (err, res) {
                        res.should.not.be.null;
                        res.should.have.property('name', 'Collection 1');
                        res.should.have.property('description', 'Description 1');
                        res.should.have.property('storyIds');
                        res.storyIds.should.include('abc1');
                        res.storyIds.should.include('def2');
                        res.should.have.property('slug', 'slug 1');
                        done();
                    });
                });
        });
    });

    /*
     * Test the DELETE route
     */
    describe('DELETE authoring/admin/collection', function () {
        it('it should DELETE one the authoring/admin/collection', function (done) {
            new CoreSchema.StoryCollection({name: "Collection 1", description: "Description 1", storyIds: ["abc1", "def2"], slug: "slug 1"}).save()
                .then(() => new CoreSchema.StoryCollection({name: "Collection 2", description: "Description 2", storyIds: ["abc1", "def2"], slug: "slug 2"}).save())
                .then(storyCollection => storyCollection.id)
                .then(collectionId => {
                    return new Promise((resolve) => {
                        chai.request(server)
                            .delete(`/storyplaces/authoring/admin/collection/${collectionId}`)
                            .set("Authorization", authHeader)
                            .end(function (err, res) {
                                res.should.have.status(200);
                                res.body.should.have.property('success', true);
                                resolve();
                            });
                    });
                })
                .then(() => {
                    CoreSchema.StoryCollection.find({}, (err, res) => {
                        res.should.not.be.null;
                        res.length.should.be.eql(1);
                        done();
                    });
                });
        });
    });

    describe('PUT authoring/admin/collection', function () {
        it('it should update one authoring/admin/collection', function (done) {
            let updatedCollection = {name: "Collection 2 updated", description: "Description 2 updated", storyIds: ["abc11", "def12"], slug: "slug 2 updated"}
            let updatedCollectionId;

            new CoreSchema.StoryCollection({name: "Collection 1", description: "Description 1", storyIds: ["abc1", "def2"], slug: "slug 1"}).save()
                .then(() => new CoreSchema.StoryCollection({name: "Collection 2", description: "Description 2", storyIds: ["abc1", "def2"], slug: "slug 2"}).save())
                .then(storyCollection => storyCollection.id)
                .then(collectionId => new Promise(resolve => {
                    updatedCollectionId = collectionId;
                    chai.request(server)
                        .put(`/storyplaces/authoring/admin/collection/${collectionId}`)
                        .set("Authorization", authHeader)
                        .send(updatedCollection)
                        .end(function (err, res) {
                            res.should.have.status(200);
                            resolve();
                        });
                }))
                .then(() => {
                    CoreSchema.StoryCollection.findById(updatedCollectionId, (err, res) => {
                            res.should.have.property('name', 'Collection 2 updated');
                        });
                    done();
                });
        });
    });
});