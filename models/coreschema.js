var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var Card = new Schema({
	content: String
});

var Story = new Schema({
	name: String,
	deck: [Card]
});

var Variable = new Schema({
	key: String,
	value: Schema.Types.Mixed
});

var Reading = new Schema({
	name: String,
	story: String,
	variables: [Variable]
});


module.exports = {
	Card: mongoose.model('Card', Card),
	Story: mongoose.model('Story', Story),
	Variable: mongoose.model('Variable', Variable),
	Reading: mongoose.model('Reading', Reading)
}

