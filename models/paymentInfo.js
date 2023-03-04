var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var dishSchema = new mongoose.Schema({
	catererId: { type: Schema.ObjectId, ref: 'caterer' },
	driverId: { type: Schema.ObjectId, ref: 'driver' },
	clientId: { type: Schema.ObjectId, ref: 'user' },
	userType: { type: String },
	paymentId: {type: String,required: true},
     customerId: {type: String,required: true},
     cardBrand: {type: String,required: true},
     last4: {type: String,required: true},
     expiryMonth: { type: Number,required: true, },
     expiryYear: { type: Number,required: true,},
}, {timestamps: true});

module.exports = mongoose.model("paymentmethod", dishSchema);
