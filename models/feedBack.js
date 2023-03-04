var mongoose = require("mongoose");
const Joi = require("joi");

var Schema = mongoose.Schema;

var ratingsSchema = new Schema({
	stars: {type: String},
	subscriptionId:{ type: Schema.ObjectId, ref: 'subscription' },
	name:{type: String},
	comment:{type: String}
});

const FeedBack = mongoose.model("feedBack", ratingsSchema);
function validateFeedBack(feedBack) {
    const schema = Joi.object({
        stars: Joi.string().required(),
		subscriptionId: Joi.objectId().required(),
        name: Joi.string().required(),
        comment: Joi.string().required()
    })
    return schema.validate(feedBack)
}


exports.FeedBack = FeedBack
exports.validate = validateFeedBack