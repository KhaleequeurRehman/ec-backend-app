// var mongoose = require("mongoose");
// var Schema = mongoose.Schema;

// var DishSchema = new Schema({
// 	dishId: {type: Schema.ObjectId, ref: 'dish' },
// 	scheduleDate:{type: Date}
//  },{timestamps: false});

// var CourseSchema = new Schema({
// 	name: {type: String},
// 	quantity: {type: Number},
// 	dish:[DishSchema]
//  },{timestamps: false});

// var pauseOrCancelSchema = new Schema({
// 	to: {type: Date},
// 	from: {type: Date},
// 	reason:{type: String}
//  },{timestamps: false});

// var mealPlanSchema = new Schema({
//      mealPlanId:{ type: Schema.ObjectId, ref: 'mealplane' },
// 	mealCourse: [CourseSchema],
//      addOnes: [CourseSchema],
//  },{timestamps: false});

// var subscriptionSchema = new mongoose.Schema({
//      subId: {type: String},
// 	user:{ type: Schema.ObjectId, ref: 'user' },
// 	mealPlane: [mealPlanSchema],
// 	quantity: {type: Number},
//      caterer: { type: Schema.ObjectId, ref: 'caterer' },
//      period: {type: String},
//      type: {type: String},
//      to: {type: Date},
//      from: {type: Date},
//      deliveryTime: {type: String},
//      deliveryAddress: { type: Schema.ObjectId, ref: 'user' },
//      driver: { type: Schema.ObjectId, ref: 'driver' },
//      price: {type: String},
//      promotionCode: {type: String},
//      paymentMethod: {type: String},
//      category: {type: String},
//      scheduleDay: {type: Array},
//      activeDate:{type: Date},
//      cancel: pauseOrCancelSchema,
//      pause: pauseOrCancelSchema,
//      status: {type: String},
//      deliveryCharges: {type: String},
//      tax: {type: String}
// }, {timestamps: true});

// module.exports = mongoose.model("subscription", subscriptionSchema);


var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var DishSchema = new Schema({
	dishId: {type: Schema.ObjectId, ref: 'dish' },
	scheduleDate:{type: Date}
 },{timestamps: false});

var CourseSchema = new Schema({
	name: {type: String},
	quantity: {type: Number},
	dish:[DishSchema]
 },{timestamps: false});

var pauseOrCancelSchema = new Schema({
	to: {type: Date},
	from: {type: Date},
	reason:{type: String}
 },{timestamps: false});

var mealPlanSchema = new Schema({
     mealPlanId:{ type: Schema.ObjectId, ref: 'mealplane' },
	mealCourse: [CourseSchema],
     addOnes: [CourseSchema],
 },{timestamps: false});

var subscriptionSchema = new mongoose.Schema({
     subId: {type: String},
	user:{ type: Schema.ObjectId, ref: 'user' },
	mealPlane: [mealPlanSchema],
	quantity: {type: Number},
     caterer: { type: Schema.ObjectId, ref: 'caterer' },
     period: {type: String},
     type: {type: String},
     to: {type: Date},
     from: {type: Date},
     deliveryTime: {type: String},
     deliveryAddress: { type: Schema.ObjectId, ref: 'user' },
     driver: { type: Schema.ObjectId, ref: 'driver' },
     price: {type: String},
     promotionCode: {type: String},
     paymentMethod: {type: String},
     category: {type: String},
     scheduleDay: {type: Array},
     activeDate:{type: Date},
     cancel: pauseOrCancelSchema,
     pause: pauseOrCancelSchema,
     status: {type: String},
     deliveryCharges: {type: String},
     tax: {type: String}
}, {timestamps: true});

module.exports = mongoose.model("subscription", subscriptionSchema);


// var mongoose = require("mongoose");
// var Schema = mongoose.Schema;

// var DishSchema = new Schema({
// 	dishId: {type: Schema.ObjectId, ref: 'dish' },
// 	scheduleDate:{type: Date}
//  },{timestamps: false});

// var CourseSchema = new Schema({
// 	name: {type: String},
// 	quantity: {type: Number},
// 	dish:[DishSchema]
//  },{timestamps: false});

// var pauseOrCancelSchema = new Schema({
// 	to: {type: Date},
// 	from: {type: Date},
// 	reason:{type: String}
//  },{timestamps: false});

// var mealPlanSchema = new Schema({
//      mealPlanId:{ type: Schema.ObjectId, ref: 'mealplane' },
// 	mealCourse: [CourseSchema],
//      addOnes: [CourseSchema],
//  },{timestamps: false});

// var subscriptionSchema = new mongoose.Schema({
//      subId: {type: String},
// 	user:{ type: Schema.ObjectId, ref: 'user' },
// 	mealPlane: [mealPlanSchema],
// 	quantity: {type: Number},
//      caterer: { type: Schema.ObjectId, ref: 'caterer' },
//      period: {type: String},
//      type: {type: String},
//      to: {type: Date},
//      from: {type: Date},
//      deliveryTime: {type: String},
//      deliveryAddress: { type: Schema.ObjectId, ref: 'user' },
//      driver: { type: Schema.ObjectId, ref: 'driver' },
//      price: {type: String},
//      promotionCode: {type: String},
//      paymentMethod: {type: String},
//      category: {type: String},
//      scheduleDay: {type: Array},
//      activeDate:{type: Date},
//      cancel: pauseOrCancelSchema,
//      pause: pauseOrCancelSchema,
//      status: {type: String},
//      deliveryCharges: {type: String},
//      tax: {type: String}
// }, {timestamps: true});

// module.exports = mongoose.model("subscription", subscriptionSchema);
