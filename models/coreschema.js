var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var User = new Schema({
	creationDate: Date
});
User.virtual('id').get(function(){
    return this._id.toHexString();
});
User.set('toJSON', {
    virtuals: true
});

var Card = new Schema({
	content: String,
	label: String,
	footerButtonMode: String
});
Card.virtual('id').get(function(){
    return this._id.toHexString();
});
Card.set('toJSON', {
    virtuals: true
});

var Story = new Schema({
	name: String,
	deck: [Card]
});
Story.virtual('id').get(function(){
    return this._id.toHexString();
});
Story.set('toJSON', {
    virtuals: true
});

var Variable = new Schema({
	key: String,
	value: Schema.Types.Mixed
});
Variable.virtual('id').get(function(){
    return this._id.toHexString();
});
Variable.set('toJSON', {
    virtuals: true
});

var Reading = new Schema({
	name: String,
	story: String,
	user: String,
	variables: [Variable]
});
Reading.virtual('id').get(function(){
    return this._id.toHexString();
});
Reading.set('toJSON', {
    virtuals: true
});


module.exports = {
	User: mongoose.model('User', User),
	Card: mongoose.model('Card', Card),
	Story: mongoose.model('Story', Story),
	Variable: mongoose.model('Variable', Variable),
	Reading: mongoose.model('Reading', Reading)
}

