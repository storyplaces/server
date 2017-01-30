/* *****************************************************************************
 *
 * StoryPlaces

 This application was developed as part of the Leverhulme Trust funded
 StoryPlaces Project. For more information, please visit storyplaces.soton.ac.uk
 Copyright (c) $today.year
 University of Southampton
 Charlie Hargood, cah07r.ecs.soton.ac.uk
 Kevin Puplett, k.e.puplett.soton.ac.uk
 David Pepper, d.pepper.soton.ac.uk
 Andy Day, a.r.day.soton.ac.uk
 All rights reserved.
 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:
 - Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.
 - Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in the
 documentation and/or other materials provided with the distribution.
 - The name of the University of Southampton nor the name of its
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

// AuthoringUser -----------------------------------------------------------------------

var AuthoringUser = new Schema({
    email: {type: String, required: true},
    name: {type: String, required: true},
    bio: String,
    role: {
        type: String,
        enum: ['writer', 'publisher', 'researcher', 'admin'],
        required: true
    }
});

AuthoringUser.virtual('id').get(function () {
    return this._id.toHexString();
});

AuthoringUser.set('toJSON', {
    virtuals: true
});

// AuthoringPage -----------------------------------------------------------------------

var AuthoringPage = new Schema({
    name: {type: String, required: true},
    content: {type: String, required: true},
    pageHint: {type: String, required: true},
    locationId: String,
    allowMultipleReadings: {type: Boolean, required: true},
    unlockedByPageIds: [{type: String, ref: 'AuthoringPage'}],
    unlockedByPagesOperator: {
        type: String,
        enum: ['and', 'or'],
        required: true
    }
});

AuthoringPage.virtual('id').get(function () {
    return this._id.toHexString();
});

AuthoringPage.set('toJSON', {
    virtuals: true
});

// AuthoringStory ----------------------------------------------------------------------

var AuthoringStory = new Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    createdDate: {type: Date, required: true},
    modifiedDate: {type: Date, required: true},
    audience: {
        type: String,
        enum: ['general', 'advisory', 'family'],
        required: true
    },
    authorIds: {
        type: [{type: String, ref: 'AuthoringUser'}],
        required: true
    },
    chapters: {
        type: [AuthoringChapter],
        required: true
    },
    pages: {
        type: [AuthoringPage],
        required: true
    },
    locations: {
        type: [AuthoringCircleLocation],
        required: true
    },
    tags: {
        type: [String],
        required: true
    },
});

AuthoringStory.virtual('id').get(function () {
    return this._id.toHexString();
});

AuthoringStory.set('toJSON', {
    virtuals: true
});

// AuthoringCircleLocation -------------------------------------------------------------------

var AuthoringCircleLocation = new Schema({
    lat: {type: Number, required: true},
    long: {type: Number, required: true},
    radius: {type: Number, required: true}
});

AuthoringCircleLocation.virtual('id').get(function () {
    return this._id.toHexString();
});

AuthoringCircleLocation.set('toJSON', {
    virtuals: true
});

// AuthoringChapter ---------------------------------------------------------

var AuthoringChapter = new Schema({
    name: {type: String, required: true},
    colour: {
        type: String,
        enum: ['aqua', 'black', 'blue', 'fuchsia', 'gray', 'green', 'lime', 'maroon', 'navy', 'olive', 'purple', 'red', 'silver', 'teal', 'white', 'yellow'],
        required: true
    },
    pageIds: {
        type: [{
            type: String,
            ref: 'AuthoringPage'
        }], required: true
    },
    unlockedByPageIds: {
        type: [{
            type: String,
            ref: 'AuthoringPage'
        }], required: true
    },
    unlockedByPagesOperator: {
        type: String,
        enum: ['and', 'or'],
        required: true
    },
    locksAllOtherChapters: {type: Boolean, required: true},
    locksChapters: {
        type: [{
            type: String,
            ref: 'AuthoringChapter'
        }], required: true
    }
});

AuthoringChapter.virtual('id').get(function () {
    return this._id.toHexString();
});

AuthoringChapter.set('toJSON', {
    virtuals: true
});

// Exports --------------------------------------------------------------------

module.exports = {
    AuthoringUser: mongoose.model('AuthoringUser', AuthoringUser),
    AuthoringPage: mongoose.model('AuthoringPage', AuthoringPage),
    AuthoringChapter: mongoose.model('AuthoringChapter', AuthoringChapter),
    AuthoringCircleLocation: mongoose.model('AuthoringCircleLocation', AuthoringCircleLocation),
    AuthoringStory: mongoose.model('AuthoringStory', AuthoringStory),
};

