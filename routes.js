"use strict";

var Express = require('express');
var Router = Express.Router();              // get an instance of the express Router
var BodyParser = require('body-parser');

var User = require('./controllers/User.js');
var Story = require('./controllers/Story.js');
var Reading = require('./controllers/Reading.js');
var LogEvent = require('./controllers/LogEvent.js');
var StaticPages = require('./controllers/StaticPages.js');
var Media = require('./controllers/Media.js');

var AuthoringStory = require('./controllers/AuthoringStory.js');
var AuthoringUser = require('./controllers/AuthoringUser.js');
let AuthoringImage = require('./controllers/AuthoringImage');
let AuthoringAudio = require('./controllers/AuthoringAudio');

var SocialAuthentication = require('./controllers/SocialAuthentication');

var LogRequestToConsole = require('./middleware/LogRequestToConsole.js');
var AuthenticateUsingToken = require('./middleware/TokenAuthentication.js');
var LogErrorToConsole = require('./middleware/LogErrorToConsole.js');
var LogErrorToClient = require('./middleware/LogErrorToClient.js');

var HasPrivilege = require('./middleware/HasPrivilege');
var IsValidUser = require('./middleware/ValidUser');
var JwtAuthentication = require('./middleware/JwtAuthentication');
var InitInternalRequestStore = require('./middleware/InitInternalRequestStore');

var upload = require('./middleware/FileUpload');

Router.use(function (req, res, next) {

    if (req.path.startsWith('/authoring/story/') && req.path.endsWith('/image')) {
        if (req.method.toUpperCase() === 'POST') {
            return next();
        }

        return res.send(400);
    }

    if (['POST', 'PUT', 'PATCH'].indexOf(req.method.toUpperCase()) !== -1) {
        var contentType = req.headers['content-type'];
        if (!contentType || contentType.indexOf('application/json') !== 0) {
            return res.send(400);
        }
    }
    next();
});

// Configure app to use BodyParser(), this will let us get the data from a POST
Router.use(BodyParser.urlencoded({extended: true, limit: '3mb'}));
Router.use(BodyParser.json({limit: '3mb'}));

Router.use(function (req, res, next) {
    //TODO: Tie this down to localhost
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Auth-Token");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
    next();
});

// Request logging
Router.use(LogRequestToConsole);

// Test route
Router.get('/', StaticPages.rootPage);

// Routes for Reading API

Router.route('/story')
    .get(Story.index)
    .post([AuthenticateUsingToken, Story.create]);

Router.route('/story/:story_id')
    .get(Story.fetch);

Router.route('/story/:story_id/media/:media_id')
    .get(Media.fetch);

Router.route('/reading')
    .post(Reading.create)
    .get([AuthenticateUsingToken, Reading.index]);

Router.route('/reading/story/:story_id/user/:user_id')
    .get(Story.readingsForUser);

Router.route('/reading/story/:story_id')
    .get([AuthenticateUsingToken, Story.allReadings]);

Router.route('/reading/:reading_id')
    .get(Reading.fetch)
    .put(Reading.update);

Router.route('/logevent')
    .post(LogEvent.create)
    .get([AuthenticateUsingToken, LogEvent.index]);

Router.route('/logevent/:logevent_id')
    .get([AuthenticateUsingToken, LogEvent.fetch]);

Router.route('/logevent/user/:user_id')
    .get([AuthenticateUsingToken, LogEvent.userFetch]);


Router.route('/user')
    .post(User.create);

Router.route('/auth/google')
    .post(SocialAuthentication.googleLogin);

Router.route('/auth/publicJwtKey')
    .get(SocialAuthentication.getPublicKey);

Router.use('/authoring', authoringRouter());

// Error logging
Router.use(LogErrorToConsole);
Router.use(LogErrorToClient);

module.exports = Router;

function authoringRouter() {
    var AuthoringRouter = Express.Router();
    AuthoringRouter.use(InitInternalRequestStore);
    AuthoringRouter.use(JwtAuthentication);
    AuthoringRouter.use(IsValidUser);

    // Get a list of pending and published Reading Stories
    AuthoringRouter.route('/admin/story')
        .get([HasPrivilege(['getReviewStories']), Story.adminindex])
        .put([HasPrivilege(['addReadingStory']), Story.create]);

    // Delete reading story
    AuthoringRouter.route('/admin/story/:story_id')
        .delete([HasPrivilege(['deleteReadingStory']), Story.remove]);

    // Update the publish status of a reading story (to pending or published)
    AuthoringRouter.route('/admin/story/:story_id/updatePublishState')
        .post([HasPrivilege(['updateReadingStoryPublishStatus']), Story.approve]);

    // Update the publish status of a reading story (to pending or published)
    AuthoringRouter.route('/admin/story/:story_id/createPreview')
        .post([HasPrivilege(['previewAnyStory']), Story.createPreview]);

    // Get a list of stories
    // Create a new story
    AuthoringRouter.route('/story')
        .get([HasPrivilege(['listOwnStories', 'listAnyStory']), AuthoringStory.index])
        .post([HasPrivilege('createStory'), AuthoringStory.create]);

    // Get an individual story
    // Update a story
    AuthoringRouter.route('/story/:story_id')
        .get([HasPrivilege(['fetchOwnStory', 'fetchAnyStory']), AuthoringStory.fetch])
        .put([HasPrivilege(['editOwnStory', 'editAnyStory']), AuthoringStory.update]);

    // Publish a story
    AuthoringRouter.route('/story/:story_id/publish')
        .post([HasPrivilege(['requestPublicationOfOwnStory', 'requestPublicationOfAnyStory']), AuthoringStory.publish]);

    // Preview a story
    AuthoringRouter.route('/story/:story_id/preview')
        .post([HasPrivilege(['previewOwnStory', 'previewAnyStory']), AuthoringStory.preview]);

    // Download reading JSON for an authoring story
    AuthoringRouter.route('/story/:story_id/downloadJson')
        .post([HasPrivilege(['requestPublicationOfOwnStory', 'requestPublicationOfAnyStory']), AuthoringStory.downloadJson]);

    // Create AuthoringUser
    // Get list of AuthoringUsers
    // AuthoringRouter.route('/user')
    //     .post([HasPrivilege(['createAuthoringUser'])], AuthoringUser.create)
    //     .get([HasPrivilege(['listAllUsers'])], AuthoringUser.index);

    // Get AuthoringUser
    // Update AuthoringUser
    AuthoringRouter.route('/user/:user_id')
        .put([HasPrivilege(['updateOwnUser', 'updateAnyUser'])], AuthoringUser.update)
        .get([HasPrivilege(['fetchOwnUser', 'fetchAnyUser'])], AuthoringUser.fetch);

    AuthoringRouter.route('/story/:story_id/image')
        .post(HasPrivilege(['uploadOwnImage']), upload.single('image'), AuthoringImage.create);

    AuthoringRouter.route('/story/:story_id/image/:image_id')
        .get(HasPrivilege(['getOwnImage']), AuthoringImage.fetch);

    AuthoringRouter.route('/story/:story_id/image/:image_id/thumb')
        .get(HasPrivilege(['getOwnImage']), AuthoringImage.fetchThumbnail);

    AuthoringRouter.route('/story/:story_id/audio')
        .post(HasPrivilege(['uploadOwnAudio']), upload.single('audio'), AuthoringAudio.create);

    AuthoringRouter.route('/story/:story_id/audio/:audio_id')
        .get(HasPrivilege(['getOwnAudio']), AuthoringAudio.fetch);

    AuthoringRouter.route('/user/')
        .get(HasPrivilege(['getUserList']), AuthoringUser.index);

    AuthoringRouter.route('/user/:user_id/assignRoles')
        .post(HasPrivilege(['assignUserRoles']), AuthoringUser.assignRoles);

    AuthoringRouter.route('/logevent/range/:start/:finish')
        .get([HasPrivilege(['readLogs']), LogEvent.fetchRange]);

    return AuthoringRouter;
}