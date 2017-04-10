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

var Logger = require('../utilities/Logger.js');

var fs = require('fs');
let settings = require('../config/settings.json');

function fileExistsAndIsReadable(fileName) {

    try {
        fs.accessSync(fileName, fs.R_OK);
    } catch (e) {
        return false;
    }

    return true;
}

function isADirectory(directory) {
    let stats;

    try {
        stats = fs.lstatSync(directory);
    } catch (e) {
        return false;
    }

    if (!stats.isDirectory()) {
        return false;
    }

    return true;
}

function isReadableandWritable(item) {
    try {
        fs.accessSync(item, fs.R_OK);
        fs.accessSync(item, fs.W_OK);
        fs.accessSync(item, fs.X_OK);
    } catch (e) {
        return false;
    }

    return true;
}

function isDirectoryOK(directory) {
    return isADirectory(directory) && isReadableandWritable(directory);
}

function fileExtension(file) {
    var filename = String(file);
    var split = filename.lastIndexOf(".");

    if (split === -1) {
        return undefined;
    }

    return filename.slice(split + 1);
}

function fileWithoutExtension(file){
    var filename = String(file);
    var split = filename.lastIndexOf(".");

    if (split === -1) {
        return undefined;
    }

    return filename.slice(0, split);
}

function getAllFiles(path, results) {
    results = results || [];
    var files = fs.readdirSync(path);

    for (var i=0 ; i < files.length; i++) {
        var name = path + '/' + files[i];
        if (fs.statSync(name).isDirectory()) {
            getAllFiles(name, results);
        } else {
            results.push(name);
        }
    }
    return results;
}


function base64EncodeFile (filePath) {
    var data = fs.readFileSync(filePath);
    return new Buffer(data).toString('base64');
}

function createFile(filePath, fileContents) {
    var result = fs.writeFileSync(filePath, fileContents);
}

/**
 * Work out the root of where we look for media based upon the settings.
 * If mediaPath is set as a absolute path then we will look there
 * otherwise we will use a relative path from the root of the application
 *
 * @returns {string}
 */
function readingMediaFolder() {
    return mediaFolder(settings.server.mediaPath);

}

function authoringMediaFolder() {
    return mediaFolder(settings.server.authoringMediaPath);
}

function mediaFolder(path) {
    if (path[0] === '/') {
        return path;
    }

    return fs.realpathSync(__dirname + '/../' + path);
}


exports.fileExistsAndIsReadable = fileExistsAndIsReadable;
exports.authoringMediaFolder = authoringMediaFolder;
exports.fileWithoutExtension = fileWithoutExtension;
exports.readingMediaFolder = readingMediaFolder
exports.base64EncodeFile = base64EncodeFile;
exports.fileExtension = fileExtension;
exports.isDirectoryOK = isDirectoryOK;
exports.getAllFiles = getAllFiles;
exports.createFile = createFile;