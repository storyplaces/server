//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

var moment = require('moment');
var jwtSimple = require('jwt-simple');

var jwtAuthenticationFunctions = require('../../auth/JwtAuthentication');

require('../utils/testing-utils');
var factories = require('../utils/testing-factories');


describe("JWT Authentication", function () {
    var user = {_id:"user_id_1"};

    describe("createJWTFromUser", function () {

        var jwt;
        var payload;
        var now;

        context("when passed an Authoring User object", function () {

            beforeEach(function () {
                now = moment().unix();
                jwt = jwtAuthenticationFunctions.createJWTFromUser(user);
                payload = jwtAuthenticationFunctions.getPayloadAndValidateJWT(jwt);
            });

            it("returns a JWT", function () {
                jwt.should.not.equal(undefined);
                (jwt.match(/\./g) || []).length.should.equal(2); // count the number of . in the JWT
            });

            it("returns a JWT which is signed with the correct key", function () {
               payload.should.not.equal(undefined);
            });

            it("returns a JWT who's subject is the ID of the user", function () {
                payload.sub.should.equal(user._id);
            });

            it("returns a JWT who's issued at is the current time", function () {
                expect(payload.iat).to.be.within(now -1, now +1);
            });
            it("returns a JWT who's expiry is in the future", function () {
                expect(payload.exp).to.be.above(now);
            });

            it("returns a JWT which has nothing else in its payload other than sub, iat and exp", function () {
                Object.keys(payload).length.should.equal(3);
            });
        })
    });

    describe("getPayloadAndValidateJWT", function () {
        context("when passed a valid JWT", function () {
            context("which has not expired", function () {
                it("returns the decoded payload", function () {
                    var jwt = jwtAuthenticationFunctions.createJWTFromUser(user);
                    var payload = jwtAuthenticationFunctions.getPayloadAndValidateJWT(jwt);

                    payload.should.not.equal(undefined);
                    (typeof payload).should.equal('object');
                });
            });

            context("which has expired", function () {
                it("rejects it", function () {

                    // Build am expired but valid JWT
                    now = moment().unix();
                    var jwt = jwtAuthenticationFunctions.createJWTFromUser(user); // Build a JWT
                    var payload = jwtAuthenticationFunctions.getPayloadAndValidateJWT(jwt); // Decode it so we get to the payload
                    payload.exp = now;
                    var expiredJWT= jwtAuthenticationFunctions.createJwtFromPayload(payload); // Make a bad JWT

                    expect(function () {
                        jwtAuthenticationFunctions.getPayloadAndValidateJWT(expiredJWT);
                    }).to.throw();

                    payload.should.not.equal(undefined);
                    (typeof payload).should.equal('object');
                });
            });
        });

        context("when passed a JWT whos header section has been altered", function () {
            it("rejects it", function () {
                var jwt = jwtAuthenticationFunctions.createJWTFromUser(user); // Build a JWT

                jwt = changeCharacterAt(jwt, 0);

                expect(function () {
                    jwtAuthenticationFunctions.getPayloadAndValidateJWT(jwt);
                }).to.throw();
            });
        });

        context("when passed a JWT whos payload section has been altered", function () {
            it("rejects it", function () {
                var jwt = jwtAuthenticationFunctions.createJWTFromUser(user); // Build a JWT

                var indexOfFirstPayloadCharacter = jwt.indexOf('.') + 1;
                jwt = changeCharacterAt(jwt, indexOfFirstPayloadCharacter);

                expect(function () {
                    jwtAuthenticationFunctions.getPayloadAndValidateJWT(jwt);
                }).to.throw();
            });
        });

        context("when passed a JWT whos signature section has been altered", function () {
            it("rejects it", function () {
                var jwt = jwtAuthenticationFunctions.createJWTFromUser(user); // Build a JWT

                var indexOfSecondPayloadCharacter = jwt.indexOf('.', jwt.indexOf('.') + 1) + 1;
                jwt = changeCharacterAt(jwt, indexOfSecondPayloadCharacter);

                expect(function () {
                    jwtAuthenticationFunctions.getPayloadAndValidateJWT(jwt);
                }).to.throw();
            });
        });

        context("when passed a JWT which is signed with the wrong key", function () {
            it("rejects it", function () {
                var jwt = jwtAuthenticationFunctions.createJWTFromUser(user); // Build a JWT
                var payload = jwtAuthenticationFunctions.getPayloadAndValidateJWT(jwt); // Get a valid payload

                var badSignatureJWT = jwtSimple.encode(payload, "this_is_a_bad_key");

                expect(function () {
                    jwtAuthenticationFunctions.getPayloadAndValidateJWT(badSignatureJWT);
                }).to.throw();
            });
        });
    });
});

function changeCharacterAt(jwt, indexOfFirstPayloadCharacter) {
    if (jwt.charAt(indexOfFirstPayloadCharacter) === 'a') {
        jwt = jwt.replaceAt(indexOfFirstPayloadCharacter, 'b');
    } else {
        jwt = jwt.replaceAt(indexOfFirstPayloadCharacter, 'a');
    }
    return jwt;
}