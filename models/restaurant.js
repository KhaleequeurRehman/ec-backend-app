var mongoose = require("mongoose");
var Schema = mongoose.Schema;


var restaurantSchema = new mongoose.Schema({
	name: { type: String },
	owner: { type: Schema.ObjectId, ref: 'caterer' },
	address: { type: String },
	area: { type: String },
	lat: { type: String },
	lng: { type: String },
	note: { type: String },
	city: { type: String },
	state: { type: String },
	country: { type: String },
	zipCode: { type: String },
	image: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("restaurant", restaurantSchema);
