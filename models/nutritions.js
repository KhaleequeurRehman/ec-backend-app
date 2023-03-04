var mongoose = require("mongoose");
const Joi = require("joi");

var Schema = mongoose.Schema;

var nutritionsSchema = new Schema({
    image: { type: String },
    title: { type: string },
});

const nutritions = mongoose.model("nutritions", nutritionsSchema);

function validateOrder(nutritions) {
    const schema = Joi.object({
        image: Joi.string().required(),
        title: Joi.string().required()
    })
    return schema.validate(nutritions)
}

exports.nutritions = nutritions
exports.validate = validateOrder