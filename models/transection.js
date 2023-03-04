var mongoose = require("mongoose"),
    Schema = mongoose.Schema;

var transectionSchema = new mongoose.Schema({
    catererId: { type: Schema.ObjectId, ref: 'caterer' },
	driverId: { type: Schema.ObjectId, ref: 'driver' },
	clientId: { type: Schema.ObjectId, ref: 'user' },
	userType: { type: String },
	type: { type: String },
    amount: {type: String},
    paymentIntent: {type: Object},
}, {timestamps: true});

module.exports = mongoose.model("transection", transectionSchema);