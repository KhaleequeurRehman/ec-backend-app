const { number } = require("joi");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CatererSchema = new mongoose.Schema({
	catererId: {type: String},
	merchantName: {type: String},
	address: {type: String},
	certification: {type: String},
	bussinessLicence: {type: String},
	idCard: {type: String},
	ownerName: {type: String},
	password: {type: String},
	email: {type: String},
	phone: {type: String},
	pin: {type: String},
	otp: {type: Number},
	role: {type: String},
	type: {type: String},
	name:{type: String},
	note:{type: String},
	status:{type: String},
	timing:{type: String},
	open:{type: Boolean, default:false},
	addedBalance: {type: String},
	addedBalanceHistory: {type: Array},
	owner:{ type: Schema.ObjectId, ref: 'caterer' },
}, {timestamps: true});

module.exports = mongoose.model("caterer", CatererSchema);







// const { number } = require("joi");
// var mongoose = require("mongoose");
// var Schema = mongoose.Schema;

// var CatererSchema = new mongoose.Schema({
// 	catererId: {type: String},
// 	merchantName: {type: String},
// 	address: {type: String},
// 	certification: {type: String},
// 	bussinessLicence: {type: String},
// 	idCard: {type: String},
// 	ownerName: {type: String},
// 	password: {type: String},
// 	email: {type: String},
// 	phone: {type: String},
// 	pin: {type: String},
// 	otp: {type: Number},
// 	role: {type: String},
// 	type: {type: String},
// 	name:{type: String},
// 	note:{type: String},
// 	status:{type: String},
// 	timing:{type: String},
// 	open:{type: Boolean, default:false},
// 	addedBalance: {type: String},
// 	addedBalanceHistory: {type: Array},
// 	owner:{ type: Schema.ObjectId, ref: 'caterer' },
// }, {timestamps: true});

// module.exports = mongoose.model("caterer", CatererSchema);
