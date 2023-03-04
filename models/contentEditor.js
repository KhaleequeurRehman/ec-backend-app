var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var contenteditorSchema = new mongoose.Schema({
	contentEditorId:{type: String},
     type:{type: String},
     link:{type: String},
     title:{type: String},
     question:{type: String},
     response: {type: String},
	image:{type: String},
	publish:{type: Boolean}
}, {timestamps: true});

module.exports = mongoose.model("contenteditor", contenteditorSchema);
