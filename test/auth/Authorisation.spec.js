//During the test the env letiable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let should = chai.should();
let expect = chai.expect;

let authorisationFunctions = require('../../auth/Authorisation');

require('../utils/testing-utils');
let factories = require('../utils/testing-factories');

describe("Authorisation", function () {

    describe("convertRolesToPrivileges", function () {
        context("when given a role that exists", function () {
            it("returns an array of privileges", function () {
                let result = authorisationFunctions.convertRolesToPrivileges(["author"]);

                Array.isArray(result).should.equal(true);
                result.length.should.not.equal(0);
                result.contains("createStory").should.equal(true);
            })
        });

        context("when given a role that does not exists", function () {
            it("returns an empty array", function () {
                let result = authorisationFunctions.convertRolesToPrivileges(["dogs body"]);

                Array.isArray(result).should.equal(true);
                result.length.should.equal(0);
            })
        });

        context("when given two roles", function () {
            it("returns an array of privileges based on both roles", function () {
                let result = authorisationFunctions.convertRolesToPrivileges(["author", "admin"]);

                Array.isArray(result).should.equal(true);
                result.length.should.not.equal(0);
                result.contains("createStory").should.equal(true);
                result.contains("deleteReadingStory").should.equal(true);
            })
        });
    });

    describe("hasPrivileges", function () {
        let userPrivileges = ["edit", "save", "delete"];

        context("when the match is set to 'all'", function () {
            let match = "all";

            context("a single item array is passed as the required privilege", function () {
                context("the passed required privilege is in the user privileges", function () {
                    it("returns true", function () {
                        let result = authorisationFunctions.hasPrivileges(["edit"], userPrivileges, match);
                        result.should.equal(true);
                    });
                });

                context("the passed required privilege is not in the user privileges", function () {
                    it("returns false", function () {
                        let result = authorisationFunctions.hasPrivileges(["create"], userPrivileges, match);
                        result.should.equal(false);
                    });
                });
            });

            context("a multiple item array is passed as the required privilege", function () {
                context("some of the the passed required privilege are in the user privileges", function () {
                    it("returns false", function () {
                        let result = authorisationFunctions.hasPrivileges(["edit", "create"], userPrivileges, match);
                        result.should.equal(false);
                    });
                });

                context("all of the the passed required privilege are in the user privileges", function () {
                    it("returns true", function () {
                        let result = authorisationFunctions.hasPrivileges(["edit", "save"], userPrivileges, match);
                        result.should.equal(true);
                    });
                });

                context("none of the the passed required privilege are in the user privileges", function () {
                    it("returns false", function () {
                        let result = authorisationFunctions.hasPrivileges(["create", "upload"], userPrivileges, match);
                        result.should.equal(false);
                    });
                });
            });
        });

        context("when the match is set to 'any'", function () {
            let match = "any";

            context("a single item array is passed as the required privilege", function () {
                context("the passed required privilege is in the user privileges", function () {
                    it("returns true", function () {
                        let result = authorisationFunctions.hasPrivileges(["edit"], userPrivileges, match);
                        result.should.equal(true);
                    });
                });

                context("the passed required privilege is not in the user privileges", function () {
                    it("returns false", function () {
                        let result = authorisationFunctions.hasPrivileges(["create"], userPrivileges, match);
                        result.should.equal(false);
                    });
                });
            });

            context("a multiple item array is passed as the required privilege", function () {
                context("some of the the passed required privilege are in the user privileges", function () {
                    it("returns true", function () {
                        let result = authorisationFunctions.hasPrivileges(["edit", "create"], userPrivileges, match);
                        result.should.equal(true);
                    });
                });

                context("all of the the passed required privilege are in the user privileges", function () {
                    it("returns true", function () {
                        let result = authorisationFunctions.hasPrivileges(["edit", "save"], userPrivileges, match);
                        result.should.equal(true);
                    });
                });

                context("none of the the passed required privilege are in the user privileges", function () {
                    it("returns false", function () {
                        let result = authorisationFunctions.hasPrivileges(["create", "upload"], userPrivileges, match);
                        result.should.equal(false);
                    });
                });
            });
        });

        context("when the match is undefined", function () {

            context("a single item array is passed as the required privilege", function () {
                context("the passed required privilege is in the user privileges", function () {
                    it("returns true", function () {
                        let result = authorisationFunctions.hasPrivileges(["edit"], userPrivileges);
                        result.should.equal(true);
                    });
                });

                context("the passed required privilege is not in the user privileges", function () {
                    it("returns false", function () {
                        let result = authorisationFunctions.hasPrivileges(["create"], userPrivileges);
                        result.should.equal(false);
                    });
                });
            });

            context("a multiple item array is passed as the required privilege", function () {
                context("some of the the passed required privilege are in the user privileges", function () {
                    it("returns true", function () {
                        let result = authorisationFunctions.hasPrivileges(["edit", "create"], userPrivileges);
                        result.should.equal(true);
                    });
                });

                context("all of the the passed required privilege are in the user privileges", function () {
                    it("returns true", function () {
                        let result = authorisationFunctions.hasPrivileges(["edit", "save"], userPrivileges);
                        result.should.equal(true);
                    });
                });

                context("none of the the passed required privilege are in the user privileges", function () {
                    it("returns false", function () {
                        let result = authorisationFunctions.hasPrivileges(["create", "upload"], userPrivileges);
                        result.should.equal(false);
                    });
                });
            });
        });
    });
});