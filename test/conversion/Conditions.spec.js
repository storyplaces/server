//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

var conditionFunctions = require('../../conversion/Conditions');
var errors = require("../../conversion/SchemaConversionErrors");

var factories = require('../utils/testing-factories');

describe("Condition functions", function () {
    var readingStory;

    beforeEach(function () {
        readingStory = factories.basicReadingStory("s1", "Story 1");
    });

    describe("createOrCondition method", function () {
        context("when passed valid data", function () {
            it("returns the ID of the new condition", function () {
                var id = conditionFunctions.createOrCondition("id", ["c1", "c2"], readingStory);
                id.should.not.equal(undefined);
            });

            it("creates conditions with a unique IDs", function () {
                var id1 = conditionFunctions.createOrCondition("id1", ["c1", "c2"], readingStory);
                var id2 = conditionFunctions.createOrCondition("id2", ["c1", "c2"], readingStory);

                id1.should.not.equal(id2);
            });

            it("throws an error if it tries to create multiple conditions with the same id", function () {
                conditionFunctions.createOrCondition("id", ["c1", "c2"], readingStory);

                expect(function () {
                    conditionFunctions.createOrCondition("id", [], readingStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("adds the condition to the reading story condition list", function () {
                var id = conditionFunctions.createOrCondition("id", ["c1", "c2"], readingStory);
                readingStory.conditions.getById(id).should.not.equal(undefined);
            });

            it("creates logical OR condition with the passed condition IDs", function () {
                var id = conditionFunctions.createOrCondition("id", ["c1", "c2"], readingStory);
                var createdCondition = readingStory.conditions.getById(id);

                createdCondition.id.should.equal("id");
                createdCondition.type.should.equal("logical");
                createdCondition.operand.should.equal("OR");
                createdCondition.conditions.length.should.equal(2);
                createdCondition.conditions.contains("c1").should.equal(true);
                createdCondition.conditions.contains("c2").should.equal(true);
            })
        });

        context("when passed invalid data", function () {
            it("should throw an exception if id id undefined", function () {
                expect(function () {
                    conditionFunctions.createOrCondition(undefined, ["c1", "c2"], readingStory);
                }).to.throw(errors.SchemaConversionError);
            });
        });
    });

    describe("createAndCondition method", function () {
        context("when passed valid data", function () {
            it("returns the ID of the new condition", function () {
                var id = conditionFunctions.createAndCondition("id", ["c1", "c2"], readingStory);
                id.should.not.equal(undefined);
            });

            it("creates conditions with a unique IDs", function () {
                var id1 = conditionFunctions.createAndCondition("id1", ["c1", "c2"], readingStory);
                var id2 = conditionFunctions.createAndCondition("id2", ["c1", "c2"], readingStory);

                id1.should.not.equal(id2);
            });

            it("throws an error if it tries to create multiple conditions with the same id", function () {
                conditionFunctions.createAndCondition("id", ["c1", "c2"], readingStory);

                expect(function () {
                    conditionFunctions.createAndCondition("id", [], readingStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("adds the condition to the reading story condition list", function () {
                var id = conditionFunctions.createAndCondition("id", ["c1", "c2"], readingStory);
                readingStory.conditions.getById(id).should.not.equal(undefined);
            });

            it("creates logical AND condition with the passed condition IDs", function () {
                var id = conditionFunctions.createAndCondition("id", ["c1", "c2"], readingStory);
                var createdCondition = readingStory.conditions.getById(id);

                createdCondition.id.should.equal("id");
                createdCondition.type.should.equal("logical");
                createdCondition.operand.should.equal("AND");
                createdCondition.conditions.length.should.equal(2);
                createdCondition.conditions.contains("c1").should.equal(true);
                createdCondition.conditions.contains("c2").should.equal(true);
            })
        });

        context("when passed invalid data", function () {
            it("should throw an exception if id id undefined", function () {
                expect(function () {
                    conditionFunctions.createAndCondition(undefined, ["c1", "c2"], readingStory);
                }).to.throw(errors.SchemaConversionError);
            });
        });
    });

    describe("createCheckCondition method", function () {
        context("when passed valid data", function () {
            it("returns the ID of the new condition", function () {
                var id = conditionFunctions.createCheckCondition("id", "v1", readingStory);
                id.should.not.equal(undefined);
            });

            it("creates conditions with a unique IDs", function () {
                var id1 = conditionFunctions.createCheckCondition("id1", "v1", readingStory);
                var id2 = conditionFunctions.createCheckCondition("id2", "v1", readingStory);

                id1.should.not.equal(id2);
            });

            it("throws an error if it tries to create multiple conditions with the same id", function () {
                conditionFunctions.createCheckCondition("id", "v1", readingStory);

                expect(function () {
                    conditionFunctions.createCheckCondition("id", [], readingStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("adds the condition to the reading story condition list", function () {
                var id = conditionFunctions.createCheckCondition("id", "v1", readingStory);
                readingStory.conditions.getById(id).should.not.equal(undefined);
            });

            it("creates check condition condition with the passed variable id", function () {
                var id = conditionFunctions.createCheckCondition("id", "v1", readingStory);
                var createdCondition = readingStory.conditions.getById(id);

                createdCondition.id.should.equal("id");
                createdCondition.type.should.equal("check");
                createdCondition.variable.should.equal("v1");
            })
        });

        context("when passed invalid data", function () {
            it("should throw an exception if id id undefined", function () {
                expect(function () {
                    conditionFunctions.createCheckCondition(undefined, "v1", readingStory);
                }).to.throw(errors.SchemaConversionError);
            });
        });
    });

    describe("createComparisonCondition method", function () {
        context("when passed valid data", function () {
            it("returns the ID of the new condition", function () {
                var id = conditionFunctions.createComparisonCondition("id", "v1", "==", "value", readingStory, "String");
                id.should.not.equal(undefined);
            });

            it("creates conditions with a unique IDs", function () {
                var id1 = conditionFunctions.createComparisonCondition("id1", "v1", "==", "value", readingStory, "String");
                var id2 = conditionFunctions.createComparisonCondition("id2", "v1", "==", "value", readingStory, "String");
                id1.should.not.equal(id2);
            });

            it("throws an error if it tries to create multiple conditions with the same id", function () {
                conditionFunctions.createComparisonCondition("id", "v1", "==", "value", readingStory, "String");

                expect(function () {
                    conditionFunctions.createComparisonCondition("id", "v1", "==", "value", readingStory, "String");
                }).to.throw(errors.SchemaConversionError);
            });

            it("adds the condition to the reading story condition list", function () {
                var id = conditionFunctions.createComparisonCondition("id", "v1", "==", "value", readingStory, "String");
                readingStory.conditions.getById(id).should.not.equal(undefined);
            });

            it("creates check condition condition with the passed variable id", function () {
                var id = conditionFunctions.createComparisonCondition("id", "v1", "==", "value", readingStory, "String");
                var createdCondition = readingStory.conditions.getById(id);

                createdCondition.type.should.equal("comparison");
                createdCondition.operand.should.equal("==");
                createdCondition.aType.should.equal('Variable');
                createdCondition.a.should.equal("v1");
                createdCondition.bType.should.equal('String');
                createdCondition.b.should.equal("value");
            })
        });

        context("when passed invalid data", function () {
            it("should throw an exception if id id undefined", function () {
                expect(function () {
                    conditionFunctions.createComparisonCondition(undefined, "v1", "==", "value", readingStory, "String");
                }).to.throw(errors.SchemaConversionError);
            });
        });
    });

    describe("createConditionVariableIsTrue method", function () {
        context("when passed valid data", function () {
            it("returns the ID of the new condition", function () {
                var id = conditionFunctions.createConditionVariableIsTrue("id", "v1", readingStory);
                id.should.not.equal(undefined);
            });

            it("creates conditions with a unique IDs", function () {
                var id1 = conditionFunctions.createConditionVariableIsTrue("id1", "v1", readingStory);
                var id2 = conditionFunctions.createConditionVariableIsTrue("id2", "v1", readingStory);

                id1.should.not.equal(id2);
            });

            it("throws an error if it tries to create multiple conditions with the same id", function () {
                conditionFunctions.createConditionVariableIsTrue("id1", "v1", readingStory);

                expect(function () {
                    conditionFunctions.createConditionVariableIsTrue("id1", "v1", readingStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("adds the condition to the reading story condition list", function () {
                var id = conditionFunctions.createConditionVariableIsTrue("id1", "v1", readingStory);
                readingStory.conditions.getById(id).should.not.equal(undefined);
            });

            it("creates check condition condition with the passed variable id", function () {
                var id = conditionFunctions.createConditionVariableIsTrue("id1", "v1", readingStory);
                var createdCondition = readingStory.conditions.getById(id);

                createdCondition.id.should.equal("id1");
                createdCondition.type.should.equal("comparison");
                createdCondition.operand.should.equal("==");
                createdCondition.aType.should.equal('Variable');
                createdCondition.a.should.equal("v1");
                createdCondition.bType.should.equal('String');
                createdCondition.b.should.equal("true");
            })
        });

        context("when passed invalid data", function () {
            it("should throw an exception if id id undefined", function () {
                expect(function () {
                    conditionFunctions.createConditionVariableIsTrue(undefined, "v1", readingStory);
                }).to.throw(errors.SchemaConversionError);
            });
        });
    });

    describe("createConditionVariableIsFalse method", function () {
        context("when passed valid data", function () {
            it("returns the ID of the new condition", function () {
                var id = conditionFunctions.createConditionVariableIsFalse("id", "v1", readingStory);
                id.should.not.equal(undefined);
            });

            it("creates conditions with a unique IDs", function () {
                var id1 = conditionFunctions.createConditionVariableIsFalse("id1", "v1", readingStory);
                var id2 = conditionFunctions.createConditionVariableIsFalse("id2", "v1", readingStory);

                id1.should.not.equal(id2);
            });

            it("throws an error if it tries to create multiple conditions with the same id", function () {
                conditionFunctions.createConditionVariableIsFalse("id1", "v1", readingStory);

                expect(function () {
                    conditionFunctions.createConditionVariableIsFalse("id1", "v1", readingStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("adds the condition to the reading story condition list", function () {
                var id = conditionFunctions.createConditionVariableIsFalse("id1", "v1", readingStory);
                readingStory.conditions.getById(id).should.not.equal(undefined);
            });

            it("creates check condition condition with the passed variable id", function () {
                var id = conditionFunctions.createConditionVariableIsFalse("id1", "v1", readingStory);
                var createdCondition = readingStory.conditions.getById(id);

                createdCondition.id.should.equal("id1");
                createdCondition.type.should.equal("comparison");
                createdCondition.operand.should.equal("==");
                createdCondition.aType.should.equal('Variable');
                createdCondition.a.should.equal("v1");
                createdCondition.bType.should.equal('String');
                createdCondition.b.should.equal("false");
            })
        });

        context("when passed invalid data", function () {
            it("should throw an exception if id id undefined", function () {
                expect(function () {
                    conditionFunctions.createConditionVariableIsFalse(undefined, "v1", readingStory);
                }).to.throw(errors.SchemaConversionError);
            });
        });
    });
    
    describe("createConditionVariableIsNotTrue method", function () {
        context("when passed valid data", function () {
            it("returns the ID of the new condition", function () {
                var id = conditionFunctions.createConditionVariableIsNotTrue("id", "v1", readingStory);
                id.should.not.equal(undefined);
            });

            it("creates conditions with a unique IDs", function () {
                var id1 = conditionFunctions.createConditionVariableIsNotTrue("id1", "v1", readingStory);
                var id2 = conditionFunctions.createConditionVariableIsNotTrue("id2", "v1", readingStory);

                id1.should.not.equal(id2);
            });

            it("throws an error if it tries to create multiple conditions with the same id", function () {
                conditionFunctions.createConditionVariableIsNotTrue("id1", "v1", readingStory);

                expect(function () {
                    conditionFunctions.createConditionVariableIsNotTrue("id1", "v1", readingStory);
                }).to.throw(errors.SchemaConversionError);
            });

            it("adds the condition to the reading story condition list", function () {
                var id = conditionFunctions.createConditionVariableIsNotTrue("id1", "v1", readingStory);
                readingStory.conditions.getById(id).should.not.equal(undefined);
            });

            it("creates check condition condition with the passed variable id", function () {
                var id = conditionFunctions.createConditionVariableIsNotTrue("id1", "v1", readingStory);
                var createdCondition = readingStory.conditions.getById(id);

                createdCondition.id.should.equal("id1");
                createdCondition.type.should.equal("comparison");
                createdCondition.operand.should.equal("!=");
                createdCondition.aType.should.equal('Variable');
                createdCondition.a.should.equal("v1");
                createdCondition.bType.should.equal('String');
                createdCondition.b.should.equal("true");
            })
        });

        context("when passed invalid data", function () {
            it("should throw an exception if id id undefined", function () {
                expect(function () {
                    conditionFunctions.createConditionVariableIsNotTrue(undefined, "v1", readingStory);
                }).to.throw(errors.SchemaConversionError);
            });
        });
    });
});
