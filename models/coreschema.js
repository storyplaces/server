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
	footerButtonMode: String,
	conditions:[String],
	functions:[String]
});
Card.virtual('id').get(function(){
    return this._id.toHexString();
});
Card.set('toJSON', {
    virtuals: true
});

var Story = new Schema({
	name: String,
	deck: [Card],
	conditions: [Schema.Types.Mixed],
	functions: [Function]
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

var Function = new Schema({
	name: String,
	type: String,
	arguments: [String]
});
Function.virtual('id').get(function(){
    return this._id.toHexString();
});
Function.set('toJSON', {
    virtuals: true
});

var ComparissonCondition = new Schema({
	name: String,
	type: {type: String, default: "comparisson"},
	operand: String,
	a: String,
	aType: String,
	b: String,
	bType: String
});
ComparissonCondition.virtual('id').get(function(){
    return this._id.toHexString();
});
ComparissonCondition.set('toJSON', {
    virtuals: true
});


var LogicalCondition = new Schema({
	name: String,
	type: {type: String, default: "logical"},
	operand: String,
	conditions: [String]
});
LogicalCondition.virtual('id').get(function(){
    return this._id.toHexString();
});
LogicalCondition.set('toJSON', {
    virtuals: true
});



module.exports = {
	User: mongoose.model('User', User),
	Card: mongoose.model('Card', Card),
	Story: mongoose.model('Story', Story),
	Variable: mongoose.model('Variable', Variable),
	Reading: mongoose.model('Reading', Reading),
	Function: mongoose.model('Function', Function),
	ComparissonCondition: mongoose.model('ComparissonCondition', ComparissonCondition),
	LogicalCondition: mongoose.model('LogicalCondition', LogicalCondition)
}

