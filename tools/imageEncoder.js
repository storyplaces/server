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

// Searches the specified directory for files with an image type extension (see imageExtensions below), converts images to base64 encoding and saves back out as originalFileName.txt

"use strict";

var fs = require("fs");
var util = require("util");
var File = require('../utilities/File.js');

var Media = require('../models/Media.js');

var imageExtensions = ['gif', 'jpg', 'jpeg', 'png'];

function displayHelp() {
    console.log("USAGE: node imageEncoder.js storyId");
}


function validateStoryId(storyId) {
    storyId = Media.validateId(storyId);
	
    if (!storyId) {
        return undefined;
    }

    if (!File.fileExistsAndIsReadable(Media.fullPath(storyId))) {
    //    return undefined;
    }

    return storyId;

}

function jsonEncodeFile (file) {
    return {
        "contentType" : getContentType(file),
        "content" : File.base64EncodeFile(file)
    };
}

function getContentType(file) {
    var extension = File.fileExtension(file);

    if (isImageExtension(extension)) {
        extension = (extension === "jpg") ? "jpeg" : extension;
        return "image/" + extension;
    }

    return undefined;
}

function isImageExtension(extension) {
    return (imageExtensions.indexOf(extension) !== -1);
}

function processImages() {

    // check path is supplied
    if (process.argv.length !== 3) {
        displayHelp();
        return;
    }

    var storyId = process.argv[2];
    storyId = validateStoryId(storyId);

    if (!storyId) {
        var message = util.format('The specified story "%s" does not exist.', process.argv[2]);
        console.log(message);
        return;
    }

    var files = File.getAllFiles(Media.fullPath(storyId));
    
    files.forEach(function (filePath) {
        // get the file extension
        var extension = File.fileExtension(filePath).toLowerCase();

        if (isImageExtension(extension)) {
            // is there already an equivalent txt version?
            var filePathWithJsonExtension = File.fileWithoutExtension(filePath) + ".json";

            if ( ! File.fileExistsAndIsReadable(filePathWithJsonExtension)) {
                console.log("JSON encoding " + filePath);
                var encoded = jsonEncodeFile(filePath);
                File.createFile(filePathWithJsonExtension, JSON.stringify(encoded));
            }
        }
    });
}

processImages();
console.log("Done");

