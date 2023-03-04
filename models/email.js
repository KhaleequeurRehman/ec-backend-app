const { Double } = require("mongodb");

var mongoose = require("mongoose"),
    Schema = mongoose.Schema;

var email = new mongoose.Schema({
    from: {type: String,lowercase: true},
    to: {type: String,lowercase: true},
    subject: {type: String},
    images:{type: Array},
    description: {type: String},
    status: {type : String},
    source:{type:String},
    MailSeqNumber:{type:Number},
    reply:{type:Boolean},
    date:{type:Date},
    time:{type:String},
    TimeInFloat:{type:Number},
    period:{type:Boolean},
    periodStartDate:{type:Date},
    periodEndDate:{type:Date}
}, {timestamps: true});       

module.exports = mongoose.model("email", email);