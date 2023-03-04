var mongoose = require("mongoose"),
    Schema = mongoose.Schema;

var CronSchema = new mongoose.Schema({
    url: {type: String},
    code: {type: Number},
    message: {type: String},
    status: {type: Boolean},
    start: {type: String}
}, {timestamps: true});

module.exports = mongoose.model("Cron", CronSchema);