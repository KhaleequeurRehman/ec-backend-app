var mongoose = require("mongoose");
const Joi = require("joi");

var Schema = mongoose.Schema;

var userRolesSchema = new Schema({
    title: { type: String },
    modules:[]
},{timestamps:true});

const UserRoles = mongoose.model("userRole", userRolesSchema);

function validateUserRole(userRole) {
    const schema = Joi.object({
        title: Joi.string().required(),
        modules: Joi.array().required()
    })
    return schema.validate(userRole)
}

exports.UserRoles = UserRoles
exports.validate = validateUserRole