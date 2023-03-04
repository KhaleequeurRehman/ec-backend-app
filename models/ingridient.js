var mongoose = require("mongoose");
const Joi = require("joi");

var Schema = mongoose.Schema;

var ingridientSchema = new Schema({
    image: { type: String },
    title: { type: string },
});

const Ingridient = mongoose.model("ingridient", ingridientSchema);

function validateOrder(ingridient) {
    const schema = Joi.object({
        image: Joi.string().required(),
        title: Joi.string().required()
    })
    return schema.validate(ingridient)
}

exports.Ingridient = Ingridient
exports.validate = validateOrder