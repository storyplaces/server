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
        return undefined;
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

