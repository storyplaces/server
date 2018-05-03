# This is the storyplaces server
> For the StoryPlaces client please see the Story Places Client repository

## Requirements
* nodejs
* npm
* mongo


## Installation
### Mongo setup
* Create a mongo instance with a suitable username and password for the 'storyplaces' database.
  * There are several good guides on the internet on how to do this, however we can not cover the details here and it is up to you to ensure you instance is properly configured, especially as Mongo comes fully open out of the box!

### JWT signing keys
* If you are using the authoring tool you will require a RS256 key pair to sign the JWT with.  You will need to create these and set their paths as described later
  * Again this is beyond the scope of this document and there are good examples of how to do this.  We would strongly suggest storing them outside of any of the repository folders.
  
### HTTPS certificates
* If you wish to use HTTPS you will need to generate a set of certs for the server to use.  Again, this is outside of the scope of this document.

### graphicsmagick
To resize images uploaded by authors graphicsmagick is required.  Please install this using your distribution.

### Directory structure
* We suggest creating one directory to hold all the components.
* Clone this repository, the reading tool and if required the authoring tool into separate directories under the above directory.

### Configuring the server tool
* Copy `config/settings.json.default` to `config/settings.json`
* Edit `config/settings.json` and:
  * Change the locations of the reading and authoring tool paths to the paths of their respective dist folders
  * Change the locations of the media paths to match your installation
  * Enable https if you wish the server to support https.  You will also need to set the certificate locations in the `secrets.json` file.
* Copy `config/secrets.json.default` to `config/secrets.json`
* Edit `config/secrets.json` and:
  * Set the database connection information as required by your installation
  * Set a strong password in `auth.value`
  * If using the authoring tool set the location of your JWT signing keys in the `auth.jwt.*` fields
  * If using the authoring tool set your googld OAuth2 secret in the `auth.socialProviders.google.secretToken` field
  * If using HTTPS set the location of your ssl certs in the `ssl.*` fields.  If you do not need a ca, remove the entry.
  
* run `npm install`

## Server start up
* run `node server.js`
* Point your browser at `<server>:8080` and you will see the client

## Installing test data
* POST the data to `<server>:8080/storyplaces/story` with the content type set as `application\json` and the test data as the body of the request.

## Copyright
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


=======
# server
Storyplaces is a tool to facilitate the authoring and reading of location-aware hypertext narratives.  This is the backend.
