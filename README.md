# This is the storyplaces server
> For the StoryPlaces client please see the Story Places Client repository

## Requirements
nodejs
npm
mongo


## Installation
* Create an install folder and cd to it.
* Clone this repository to `StoryPlacesServer`
* Clone client repository to `StoryPlacesClient`
* cd into `StoryPlacesServer`
* run `npm install`

## Server setup
* run `node server.js`
* Point your browser at `<server>:8080` and you will see the client

## Installing test data
* POST the data to `<server>:8080/storyplaces/story` with the content type set as `application\json` and the test data as the body of the request.


