"use strict";


var Multer = require('multer');
let crypto = require('crypto');
let fs = require('fs');

let helpers = require('../controllers/helpers.js');

let file_utilities = require('../utilities/File');

let storage = Multer.diskStorage({
    destination: function (req, file, cb) {
        let storyId;
        try {
            storyId = helpers.validateId(req.params.story_id);
        } catch (error) {
            return cb(error);
        }

        let path = file_utilities.authoringMediaFolder() + "/" + storyId + "/";
        let stats;

        try {
            stats = fs.lstatSync(path);
        } catch (e) {
            fs.mkdirSync(path, 0o700);
            return cb(null,path);
        }

        if (!stats.isDirectory()) {
            return cb(new Error("Non directory exists with story name in authoring media"));
        }

        return cb(null, path);
    },
    filename: function (req, file, cb) {
        let fileExtension = file.mimetype.substr(file.mimetype.lastIndexOf('/') + 1);

        if(fileExtension !== "png" && fileExtension !== "jpeg" && fileExtension !== "mp3" && fileExtension !== "mp4" && fileExtension !== "mpeg") {
            return cb(new Error("Bad file extension"));
        }

        let baseName = crypto.createHash('md5')
            .update(file.originalname + Date.now().toString())
            .digest('hex');

        let filename = baseName + "." + fileExtension;
        cb(null, filename);
    }
});

let upload = Multer({
    limits: {fileSize: 10 * 1024 * 1024, files: 1},
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png' && file.mimetype !== 'audio/mp3' && file.mimetype !== 'audio/mpeg') {
            let error = new Error("Bad file format");
            error.status = 400;
            error.clientMessage = "Bad file format";
            cb(error);
        }

        cb(null, true);
    },
    storage: storage
});



module.exports = upload;

