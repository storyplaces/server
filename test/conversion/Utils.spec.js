//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var chai = require('chai');
let should = chai.should();
var expect = chai.expect;

var utilFunctions = require('../../conversion/Utils');
var errors = require("../../conversion/SchemaConversionErrors");

describe("Utility functions", function () {
    describe("checkIdDoesNotExist", function () {
        var existingItems;

        context("the existing items array is empty", function () {
            beforeEach(function () {
                existingItems = [];
            });

            it("will not throw an error if a defined ID is passed", function () {
                expect(function () {
                    utilFunctions.checkIdDoesNotExist("new-1", existingItems);
                }).to.not.throw();
            });

            it("will not throw an error if an undefined ID is passed", function () {
                expect(function () {
                    utilFunctions.checkIdDoesNotExist(undefined, existingItems);
                }).to.not.throw();
            });
        });

        context("the existing items array does not have the new ID in it", function () {
            beforeEach(function () {
                existingItems = [{id: "existing-1"}, {id: "existing-2"}, {id: "existing-3"}];
            });

            it("will not throw an error if a defined ID is passed", function () {
                expect(function () {
                    utilFunctions.checkIdDoesNotExist("new-1", existingItems);
                }).to.not.throw();
            });

            it("will not throw an error if an undefined ID is passed", function () {
                expect(function () {
                    utilFunctions.checkIdDoesNotExist(undefined, existingItems);
                }).to.not.throw();
            });
        });

        context("the existing items array does have the new ID in it", function () {
            beforeEach(function () {
                existingItems = [{id: "existing-1"}, {id: "existing-2"}, {id: "existing-3"}, {id: "new-1"}];
            });

            it("will throw an error if a defined ID is passed", function () {
                expect(function () {
                    utilFunctions.checkIdDoesNotExist("new-1", existingItems);
                }).to.throw(errors.SchemaConversionError);
            });

            it("will not throw an error if an undefined ID is passed", function () {
                expect(function () {
                    utilFunctions.checkIdDoesNotExist(undefined, existingItems);
                }).to.not.throw();
            });
        });
    });

    describe("arraysMatch", function () {
       context("when passed two empty arrays", function () {
           it("will return true", function () {
               var array1 = [];
               var array2 = [];

               var result = utilFunctions.arraysMatch(array1, array2);

               console.log(result);

               result.should.equal(true);
           });
       });

       context("when passed two matching arrays", function () {
           it("will return true", function () {
               var array1 = ["1", "2", "a", "b"];
               var array2 = ["1", "2", "a", "b"];

               var result = utilFunctions.arraysMatch(array1, array2);

               result.should.equal(true);
           });
       });

       context("when passed to arrays with the same contents but in different orders", function () {
           it("will return true", function () {
               var array1 = ["1", "2", "a", "b"];
               var array2 = ["b", "1", "2", "a"];

               var result = utilFunctions.arraysMatch(array1, array2);

               result.should.equal(true);
           });
       });

       context("when array 1 has more items than array 2", function () {
           it("will return false", function () {
               var array1 = ["1", "2", "x", "a", "b"];
               var array2 = ["1", "2", "a", "b"];

               var result = utilFunctions.arraysMatch(array1, array2);

               result.should.equal(false);
           });
       });

       context("when array 2 has more items than array 1", function () {
           it("will return false", function () {
               var array1 = ["1", "2", "a", "b"];
               var array2 = ["1", "2", "x", "a", "b"];

               var result = utilFunctions.arraysMatch(array1, array2);

               result.should.equal(false);
           });
       });

       context("when no items match", function () {
           it("will return false", function () {
               var array1 = ["1", "2", "a", "b"];
               var array2 = ["w", "x", "y", "x"];

               var result = utilFunctions.arraysMatch(array1, array2);

               result.should.equal(false);
           });
       });
    });

    describe("addCondition", function () {
       it("adds the valid condition Id to the location", function () {
          var conditions = [];

           utilFunctions.addCondition("id1", conditions);

          conditions.length.should.equal(1);
          conditions[0].should.equal("id1");
       });

        it("does not add an undefined condition Id to the location", function () {
            var conditions = [];

            utilFunctions.addCondition(undefined, conditions);

            conditions.length.should.equal(0);
        });
    });
    
    describe("addFunction", function () {
       it("adds the valid function Id to the location", function () {
          var functions = [];

           utilFunctions.addFunction("id1", functions);

          functions.length.should.equal(1);
          functions[0].should.equal("id1");
       });

        it("does not add an undefined function Id to the location", function () {
            var functions = [];

            utilFunctions.addFunction(undefined, functions);

            functions.length.should.equal(0);
        });
    });

    describe("validateId", () => {
       context("when given a valid Id", () => {
           it("does not throw an exception", () => {
               utilFunctions.validateId("abc-1234");
           });
       });

       context("when given an invalid Id", () => {
          it("throws a SchemaConversionError for an undefined id", () => {
              expect(() => {
                  utilFunctions.validateId(undefined);
              }).to.throw(errors.SchemaConversionError);
          });

          it("throws a SchemaConversionError for a null id", () => {
              expect(() => {
                  utilFunctions.validateId(null);
              }).to.throw(errors.SchemaConversionError);
          });

           it("throws a SchemaConversionError for an empty string", () => {
               expect(() => {
                   utilFunctions.validateId("");
               }).to.throw(errors.SchemaConversionError);
           });

           it("throws a SchemaConversionError for an invalid id", () => {
               expect(() => {
                   utilFunctions.validateId("abc+123");
               }).to.throw(errors.SchemaConversionError);
           });
       });
    });
});
