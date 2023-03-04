var mongoose = require("mongoose");

var Schema = mongoose.Schema;


var cuisineSchema = new mongoose.Schema({
	cuisine: {type: String},
	subCuisine: {type: String},
	active: {type: Boolean},
	image: {type: String},
}, {timestamps: true});

module.exports = mongoose.model("cuisine", cuisineSchema);