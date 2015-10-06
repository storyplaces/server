// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('../StoryPlacesClient'));

var port = process.env.PORT || 5000;        // set our port

var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost:27017/storyplaces'); // connect to our database

var CoreSchema = require('./models/coreschema');


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Request Made '+req.method);
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/storyplaces)
router.get('/', function(req, res) {
    res.json({ message: 'This is the storyplaces api' });   
});

// more routes for our API will happen here

	router.route('/story')
	
	.post(function(req, res) {
        
		var story = new CoreSchema.Story(req.body)
        
        story.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Story created!' });
        });
        
    })
	
	.get(function(req, res) {
        CoreSchema.Story.find(function(err, stories) {
            if (err)
                res.send(err);

            res.json(stories);
        });
    });
	
	router.route('/story/:story_id')
	
	.get(function(req, res) {
        CoreSchema.Story.findById(req.params.story_id, function(err, story) {
            if (err)
                res.send(err);
            res.json(story);
        });
    });
	
	router.route('/story/:story_id/readings')
	
	.get(function(req, res) {
        CoreSchema.Reading.find({"story":req.params.story_id}, function(err, readings) {
            if (err)
                res.send(err);
            res.json(readings);
        });
    });
	
	router.route('/deck/:story_id')
	
	.get(function(req, res) {
        CoreSchema.Story.findById(req.params.story_id, function(err, story) {
            if (err)
                res.send(err);
            res.json(story.deck);
        });
    });
	
	router.route('/reading')
	
	.post(function(req, res) {
        
		var reading = new CoreSchema.Reading(req.body)
        
        reading.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Reading created!' });
        });
        
    })
	
	.put(function(req, res) {
        
		var reading = new CoreSchema.Reading(req.body)
        
        reading.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Reading Updated!' });
        });
        
    })
	
	.get(function(req, res) {
        CoreSchema.Reading.find(function(err, readings) {
            if (err)
                res.send(err);

            res.json(readings);
        });
    });
	
	router.route('/reading/:reading_id')
	
	.get(function(req, res) {
        CoreSchema.Reading.findById(req.params.reading_id, function(err, reading) {
            if (err)
                res.send(err);
            res.json(reading);
        });
    });
		
	router.route('/user')
	
	.post(function(req, res) {
        
		var user = new CoreSchema.User()
        
		console.log("NEW USER")
		
		user.creationDate = new Date();
		
        user.save(function(err) {
            if (err)
                res.send(err);

            res.json(user);
        });
        
    })
	
	.get(function(req, res) {
        CoreSchema.User.find(function(err, users) {
            if (err)
                res.send(err);

            res.json(users);
        });
    });


// REGISTER OUR ROUTES -------------------------------
app.use('/storyplaces', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Serving on port ' + port);