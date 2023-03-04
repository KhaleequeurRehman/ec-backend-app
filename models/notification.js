var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var notificationSchema = new mongoose.Schema({
	to:{type: String},
	title: {type: String},
	description: {type: String},
	link:{type: String},
	image:{type: String}
}, {timestamps: true});

module.exports = mongoose.model("notification", notificationSchema);
