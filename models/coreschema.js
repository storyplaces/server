/* *****************************************************************************
 *
 * StoryPlaces
 *

This application was developed as part of the Leverhulme Trust funded 
StoryPlaces Project. For more information, please visit storyplaces.soton.ac.uk

Copyright (c) 2016
  University of Southampton
    Charlie Hargood, cah07r.ecs.soton.ac.uk
    Kevin Puplett, k.e.puplett.soton.ac.uk
	David Pepper, d.pepper.soton.ac.uk

All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * The name of the Universities of Southampton nor the name of its 
	  contributors may be used to endorse or promote products derived from 
	  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE ABOVE COPYRIGHT HOLDERS BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

***************************************************************************** */

"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// User -----------------------------------------------------------------------

var User = new Schema({
    creationDate: Date
});

User.virtual('id').get(function () {
    return this._id.toHexString();
});

User.set('toJSON', {
    virtuals: true
});

// Page -----------------------------------------------------------------------

var Page = new Schema({
    content: { type: String, required: true },
    name: { type: String, required: true },
    pageTransition: { type: String, required: true },
    conditions: [{ type: String, ref: 'Schema.Types.Mixed' }],
    functions: [{ type: String, ref: 'Function' }],
    teaser: String,
    hint: {
        type: {
        direction: String,
        locations: [{type: String, ref: 'Location'}]
        },
        required: true
    }
});

Page.virtual('id').get(function () {
    return this._id.toHexString();
});

Page.set('toJSON', {
    virtuals: true
});

// Story ----------------------------------------------------------------------

var Story = new Schema({
    name: { type: String, required: true },
    pages: [Page],
    locations: [Location],
    conditions: [Schema.Types.Mixed],
    functions: [Function],
    pagesviewmode: String,
    description: String,
    author: String,
    cachedMediaIds: [Number],
	publishState: { type: String, required: true },
	tags:[String],
	pagesMapViewSettings: {
        map: Boolean,
        pageArrows: Boolean,
        pageDistance: Boolean
    },
    schemaVersion: String

});

Story.virtual('id').get(function () {
    return this._id.toHexString();
});

Story.set('toJSON', {
    virtuals: true
});

// Variable -------------------------------------------------------------------

var Variable = new Schema({
    key: String,
    value: Schema.Types.Mixed
});

Variable.virtual('id').get(function () {
    return this._id.toHexString();
});

Variable.set('toJSON', {
    virtuals: true
});

// Reading --------------------------------------------------------------------

var Reading = new Schema({
    name: String,
    story: String,
    user: String,
    variables: [Variable]
});

Reading.virtual('id').get(function () {
    return this._id.toHexString();
});

Reading.set('toJSON', {
    virtuals: true
});

// LogEvent --------------------------------------------------------------------

var LogEvent = new Schema({
    user: String,
	date: Date,
    type: String,
	data: Schema.Types.Mixed
});

LogEvent.virtual('id').get(function () {
    return this._id.toHexString();
});

LogEvent.set('toJSON', {
    virtuals: true
});

// Function -------------------------------------------------------------------

var Function = new Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    arguments: [String],
    conditions: [{ type: String, ref: 'Condition' }],
});

Function.virtual('id').get(function () {
    return this._id.toHexString();
});

Function.set('toJSON', {
    virtuals: true
});

// Location -------------------------------------------------------------------

var Location = new Schema({
    name: String,
    type: String,
    lat: Number,
    lon: Number,
    radius: Number
});

Location.virtual('id').get(function () {
    return this._id.toHexString();
});

Location.set('toJSON', {
    virtuals: true
});

// Comparison Condition -------------------------------------------------------

var ComparisonCondition = new Schema({
    name: { type: String, required: true },
    type: {type: String, default: "comparison", required: true},
    operand: { type: String, required: true },
    a: { type: String, required: true },
    aType: { type: String, required: true },
    b: { type: String, required: true },
    bType: { type: String, required: true }
});

ComparisonCondition.virtual('id').get(function () {
    return this._id.toHexString();
});

ComparisonCondition.set('toJSON', {
    virtuals: true
});

// Logical Condition ----------------------------------------------------------

var LogicalCondition = new Schema({
    name: { type: String, required: true },
    type: {type: String, default: "logical"},
    operand: { type: String, required: true },
    conditions: [{ type: String, ref: 'Condition' }],
});

LogicalCondition.virtual('id').get(function () {
    return this._id.toHexString();
});

LogicalCondition.set('toJSON', {
    virtuals: true
});


// Location Condition ---------------------------------------------------------

var LocationCondition = new Schema({
    name: { type: String, required: true },
    type: {type: String, default: "location", required: true },
    bool: { type: Boolean, required: true },
    location: { type: String, ref: 'Location', required: true }
});

LocationCondition.virtual('id').get(function () {
    return this._id.toHexString();
});

LocationCondition.set('toJSON', {
    virtuals: true
});

// Check Condition ---------------------------------------------------------

var CheckCondition = new Schema({
    name: { type: String, required: true },
    type: {type: String, default: "check"},
    variable: { type: String, ref: 'Variable' }
});

CheckCondition.virtual('id').get(function () {
    return this._id.toHexString();
});

CheckCondition.set('toJSON', {
    virtuals: true
});

// Exports --------------------------------------------------------------------

module.exports = {
    User: mongoose.model('User', User),
    Page: mongoose.model('Page', Page),
    Story: mongoose.model('Story', Story),
    Variable: mongoose.model('Variable', Variable),
    Reading: mongoose.model('Reading', Reading),
	LogEvent: mongoose.model('LogEvent', LogEvent),
    Function: mongoose.model('Function', Function),
    Location: mongoose.model('Location', Location),
    ComparisonCondition: mongoose.model('ComparisonCondition', ComparisonCondition),
    LogicalCondition: mongoose.model('LogicalCondition', LogicalCondition),
    LocationCondition: mongoose.model('LocationCondition', LocationCondition),
    CheckCondition: mongoose.model('CheckCondition', CheckCondition)

};

