var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var CardSchema = new Schema({
	content: String
});

//var DeckSchema = new Schema({
//	cards: [CardSchema]
//});

var StorySchema = new Schema({
	name: String,
	deck: [CardSchema]
});


module.exports = {
	Card: mongoose.model('Card', CardSchema),
	//Deck: mongoose.model('Deck', DeckSchema),
	Story: mongoose.model('Story', StorySchema)
}

