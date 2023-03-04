var mongoose = require("mongoose");

var AdminSchema = new mongoose.Schema({
	firstName: {type: String},
	lastName: {type: String},
	email: {type: String},
	password: {type: String},
	phone: {type: String},
	type: {type: String},
	otp:{type: String}
}, {timestamps: true});

module.exports = mongoose.model("admin", AdminSchema);