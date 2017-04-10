/* *****************************************************************************
 *
 * StoryPlaces
 *

 This application was developed as part of the Leverhulme Trust funded
 StoryPlaces Project. For more information, please visit storyplaces.soton.ac.uk

 Copyright (c) 2017
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

// server.js

"use strict";

let file = require('./utilities/File');

// Get configuration ----------------------------------------------------------
var settings = require('./config/settings.json');

if (process.env.NODE_ENV !== 'test') {
    var secrets = require('./config/secrets.json');
} else {
    var secrets = require('./config/secrets-test.json');
}

if (!file.isDirectoryOK(file.authoringMediaFolder()) || !file.isDirectoryOK(file.readingMediaFolder())) {
    console.log("Authoring: ", file.authoringMediaFolder());
    console.log("Reading: ", file.readingMediaFolder());

    console.log("Please ensure the media folders both exist and have appropriate permissions");
    process.exit(1);
}

var port = process.env.PORT || 8080;

// Load dependencies ----------------------------------------------------------
var Logger = require('./utilities/Logger.js');
var Express = require('express');
var Mongoose = require('mongoose');
var Routes = require('./routes.js');

// Build our express app ------------------------------------------------------
var App = Express();

// Connect to the database ----------------------------------------------------
Mongoose.connect(secrets.database.connection, {
    user: secrets.database.username,
    pass: secrets.database.password
}); // connect to our database

// Register the routes --------------------------------------------------------
App.use(settings.api.url, Routes);
App.use(settings.readingTool.url, Express.static(settings.readingTool.sourcePath));
App.use(settings.authoringTool.url, Express.static(settings.authoringTool.sourcePath));

// Start the server -----------------------------------------------------------
if (settings.server.useHttps) {
    startHttpsServer();
}  else{
    startHttpServer();
}

module.exports = App; //For testing

/**
 * Server start functions below here
 */

function startHttpServer() {
    var server = require('http');
    server.createServer(App).listen(port);
    Logger.log('Serving over http on port ' + port);
};

function startHttpsServer() {
    var https_options;
    var fs = require('fs');

    if (process.env.NODE_ENV !== 'test') {

        https_options = {
            key: fs.readFileSync(secrets.ssl.keypath),
            cert: fs.readFileSync(secrets.ssl.certpath)
        }

        if (secrets.ssl.capath) {
            https_options.ca = fs.readFileSync(secrets.ssl.capath, 'utf8');
        }
    } else {
        https_options = {}
    }

    var server = require('https');
    server.createServer(https_options, App).listen(port);
    Logger.log('Serving over https on port ' + port);
}