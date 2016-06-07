/**
 * Created by kep1u13 on 07/06/2016.
 */

"use strict";

var Logger = require('../utilities/Logger.js');

var fs = require('fs');

function fileExistsAndIsReadable(fileName) {

    try {
        fs.accessSync(fileName, fs.R_OK);
    } catch (e) {
        return false;
    }

    return true;
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

exports.fileExistsAndIsReadable = fileExistsAndIsReadable;
exports.fileWithoutExtension = fileWithoutExtension;
exports.base64EncodeFile = base64EncodeFile;
exports.fileExtension = fileExtension;
exports.getAllFiles = getAllFiles;
exports.createFile = createFile;