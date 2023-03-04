var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var DishSchema = new Schema({
	dishId: {type: Schema.ObjectId, ref: 'dish' },
	scheduleDate:{type: Date}
 },{timestamps: false});

var CourseSchema = new Schema({
	name: {type: String},
	dish:[DishSchema]
 },{timestamps: false});

var mealplaneSchema = new mongoose.Schema({
	image: {type: String},
	name: {type: String},
	description: {type: String},
	mealCourse: [CourseSchema],
    addOnes: [CourseSchema],
	endDate: {type: Date},
	category: {type: String},
	reviewStatus: {type: Boolean,default: false},
	forReview: {type: Boolean,default: true},
	disable: {type: Boolean,default: false},
	status: {type: String,default: "active"},
	cuisine:{ type: Schema.ObjectId, ref: 'cuisine' },
	owner:{ type: Schema.ObjectId, ref: 'caterer' }
}, {timestamps: true});

module.exports = mongoose.model("mealplane", mealplaneSchema);












// var mongoose = require("mongoose");

// var Schema = mongoose.Schema;

// var DishSchema = new Schema({
// 	dishId: {type: Schema.ObjectId, ref: 'dish' },
// 	scheduleDate:{type: Date}
//  },{timestamps: false});

// var CourseSchema = new Schema({
// 	name: {type: String},
// 	dish:[DishSchema]
//  },{timestamps: false});

// var mealplaneSchema = new mongoose.Schema({
// 	image: {type: String},
// 	name: {type: String},
// 	description: {type: String},
// 	mealCourse: [CourseSchema],
//      addOnes: [CourseSchema],
// 	endDate: {type: Date},
// 	category: {type: String},
// 	reviewStatus: {type: Boolean,default: false},
// 	forReview: {type: Boolean,default: true},
// 	cuisine:{ type: Schema.ObjectId, ref: 'cuisine' },
// 	owner:{ type: Schema.ObjectId, ref: 'caterer' }
// }, {timestamps: true});

// module.exports = mongoose.model("mealplane", mealplaneSchema);