# This is the storyplaces server
> For the StoryPlaces client please see the Story Places Client repository

## Requirements
nodejs
npm
mongo


## Installation
* Install Node.js
* Open CMD/terminal and run "npm install npm -g", because the version of npm that ships with Node.js is out of date
* Run "npm install mongodb -g"
* Make a new directory for StoryPlaces
* Clone the "storyplaces/server" repo into a folder called "StoryPlacesServer" within the folder created previously.
* Clone the "storyplaces/reading-tool" repo into a folder called "StoryPlacesReadingTool" into the same folder as above.
* You should now have two folders.
* Enter the StoryPlacesReadingTool directory and run "npm install"
* Create a folder in this directory called "db"
* Navigate to StoryPlacesServer and run "npm install" here as well

## Server setup
* Open a new CMD/terminal and run "mongodb --dbpath [path_to_db_folder_created_earlier]"
* Open another CMD/terminal and run "mongo"
* Open yet another CMD/terminal, navigate to StoryPlacesServer, and run "node server.js"
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
