// Searches the specified directory for files with an image type extension (see imageExtensions below), converts images to base64 encoding and saves back out as originalFileName.txt

var fs = require("fs");
var util = require("util");
var fileExtension = require("file-extension");

var imageExtensions = ['gif', 'jpg', 'jpeg', 'png'];

var displayHelp = function () {
    console.log("USAGE: node imageEncoder.js pathToImagesFolder");
};

var pathIsValid = function (path) {
    if (!fs.existsSync(path)) {
        var message = util.format('The specified path "%s" does not exist.', path);
        console.log(message);
        return false;
    }

    return true;
};

var getAllFiles = function (path, results) {
    results = results || [];
    var files = fs.readdirSync(path);
    for (var i in files) {
        var name = path + '\\' + files[i];
        if (fs.statSync(name).isDirectory()) {
            getAllFiles(name, results);
        } else {
            results.push(name);
        }
    }
    return results;
};

var base64EncodeFile = function (filePath) {
    var data = fs.readFileSync(filePath);
    var base64data = new Buffer(data).toString('base64');
    return base64data;
};

var createFile = function(filePath, fileContents) {
    var result = fs.writeFileSync(filePath, fileContents);    
};

var processImages = function () {

    // check path is supplied
    if (process.argv.length != 3) {
        displayHelp();
    }

    var path = process.argv[2];
    if (!pathIsValid(path)) {
        return;
    }

    var files = getAllFiles(path);
    
    files.forEach(function (filePath) {
        // get the file extension
        var extension = fileExtension(filePath).toLowerCase();

        if (imageExtensions.indexOf(extension) > -1) {
            // is there already an equivalent txt version?
            var filePathWithoutExtension = filePath.slice(0, extension.length * -1);
            var filePathWithTextExtension = filePathWithoutExtension + "txt"; 
            if (!fs.existsSync(filePathWithTextExtension)) {
                console.log("create base64 of " + filePath);
                var encoded = base64EncodeFile(filePath);
                createFile(filePathWithTextExtension, encoded);                
            }
        }
    });
};

processImages();
console.log("Done");

