var mongoose = require("mongoose");
const Joi = require("joi");

var Schema = mongoose.Schema;

var noteSchema = new mongoose.Schema({
    description: { type: String },
    userId: { type: String },
}, { timestamps: true });

const Note = mongoose.model("note", noteSchema);

function validateNote(order) {

    const schema = Joi.object({
        description: Joi.string().min(3).required(),
        userId: Joi.string().min(3).required(),
    })

    return schema.validate(order)
}

exports.Note = Note
exports.validate = validateNote
