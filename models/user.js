// var mongoose = require("mongoose");
// var Schema = mongoose.Schema;

// //Promotion , Gift Cards , Discounts 
// var DiscountSchema = new Schema({
// 	status: {type: String},
// 	assignDate: {type:Date},
// 	useDate: {type:Date},
// 	percent: {type:String}
//  },{timestamps: false});
 
// var AddressSchema = new Schema({
// 	type: {type: String},
// 	address: {type: String},
// 	city:{type: String},
// 	state:{type: String},
// 	country:{type: String},
// 	zipCode:{type: String}
//  },{timestamps: false});

// var UserSchema = new mongoose.Schema({
// 	fullName: {type: String, required: true},
// 	email: {type: String, required: true},
// 	phone: {type: String, required: true},
// 	isSubscribed: {type: Boolean},
// 	subcriptionStaus: {type: String},
// 	giftCard: [DiscountSchema],
// 	promotions: [DiscountSchema],
// 	discounts: [DiscountSchema],
// 	addresses: [AddressSchema],
// 	status: {type: String,default: 'active'},
// 	balance: {type: String,default: '0.00'}
// }, {timestamps: true});

// module.exports = mongoose.model("user", UserSchema);



var mongoose = require("mongoose");
var Schema = mongoose.Schema;

//Promotion , Gift Cards , Discounts 
var DiscountSchema = new Schema({
	status: {type: String},
	assignDate: {type:Date},
	useDate: {type:Date},
	percent: {type:String}
 },{timestamps: false});
 
var AddressSchema = new Schema({
	type: {type: String},
	address: {type: String},
	city:{type: String},
	state:{type: String},
	country:{type: String},
	zipCode:{type: String}
 },{timestamps: false});

var UserSchema = new mongoose.Schema({
	fullName: {type: String, required: true},
	email: {type: String, required: true},
	phone: {type: String, required: true},
	isSubscribed: {type: Boolean},
	subcriptionStaus: {type: String},
	giftCard: [DiscountSchema],
	promotions: [DiscountSchema],
	discounts: [DiscountSchema],
	addresses: [AddressSchema],
	status: {type: String,default: 'active'},
	balance: {type: String,default: '0.00'},
	firstName: {type: String, default:''},
	lastName: {type: String, default:''},
	password: {type: String, default:''},
	role: {type: String, default:'customer'}
}, {timestamps: true});

module.exports = mongoose.model("user", UserSchema);
