var mongoose = require("mongoose");

var DriverSchema = new mongoose.Schema({
	driverId: {type: String},
	firstName: {type: String},
	lastName: {type: String},
	email: {type: String},
	password: {type: String},
	phone: {type: String},
	city: {type: String},
	status: {type: String,default:"request"},
	deliveries: {type: Number,default:0},
	earning: {type: String,default:"0.00"},
	addedBalance: {type: String},
	addedBalanceHistory: {type: Array},
	online: {type: Boolean,default:false},
}, {timestamps: true});

module.exports = mongoose.model("driver", DriverSchema);
