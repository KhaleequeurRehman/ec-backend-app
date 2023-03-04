var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ratingsSchema = new Schema({
	stars: {type: String},
	user:{ type: Schema.ObjectId, ref: 'user' },
	name:{type: String},
	comment:{type: String}
},{timestamps: false});

var dishSchema = new mongoose.Schema({
	name: {type: String},
	description: {type: String},
	image: {type: String},
	ingridients: {type: Array},
	owner:{ type: Schema.ObjectId, ref: 'caterer' },
	reviewStatus: {type: String},
	mealCourse: {type: String},
    addOnes: {type: String},
	forReview: {type: Boolean},
	NutritionInformation: {type: Array},
	scheduleDish:{type:Date},
	searchTime:{type: Number,default:0},
	ratings:[ratingsSchema],
}, {timestamps: true});

module.exports = mongoose.model("dish", dishSchema);
