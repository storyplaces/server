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

// server.js

"use strict";

// Get configuration ----------------------------------------------------------
var secrets = require('./config/secrets.json');
var settings = require('./config/settings.json');
var port = process.env.PORT || 8080;

// Load dependencies ----------------------------------------------------------
var Logger = require('./utilities/Logger.js');
var Express = require('express');
var Mongoose = require('mongoose');
var Routes = require('./routes.js');
var https = require('https');
var fs = require('fs');

// Set up SSL ------------------------------------------------------
var key = fs.readFileSync(secrets.ssl.keypath);
var cert = fs.readFileSync(secrets.ssl.certpath)
var ca = [
            fs.readFileSync(secrets.ssl.capath, 'utf8')
        ]
var https_options = {
    key: key,
    cert: cert,
	ca: ca
};

// Build our express app ------------------------------------------------------
var App = Express();

// Connect to the database ----------------------------------------------------
Mongoose.connect(secrets.database.connection); // connect to our database

// Register the routes --------------------------------------------------------
App.use(settings.api.url,       Routes);
App.use(settings.client.url,    Express.static(settings.client.source_path));

// Start the server -----------------------------------------------------------
//App.listen(port);
https.createServer(https_options, App).listen(port);

Logger.log('Serving on port ' + port);
