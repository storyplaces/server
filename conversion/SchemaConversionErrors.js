/**
 * Created by kep1u13 on 15/03/2017.
 */

"use strict";

exports.SchemaConversionError = SchemaConversionError;
exports.StoryError = StoryError;

function SchemaConversionError(message) {
    this.name = 'SchemaConversionError';
    this.message = message || "Error converting schema";
    this.stack = (new Error()).stack;
}
SchemaConversionError.prototype = Object.create(Error.prototype);
SchemaConversionError.prototype.constructor = SchemaConversionError;

function StoryError(message) {
    this.name = 'StoryError';
    this.message = message || "Error in story";
    this.stack = (new Error()).stack;
}
StoryError.prototype = Object.create(Error.prototype);
StoryError.prototype.constructor = StoryError;
