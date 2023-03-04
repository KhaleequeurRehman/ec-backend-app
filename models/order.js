var mongoose = require("mongoose");
const Joi = require("joi");

var Schema = mongoose.Schema;

var mealPlanSchema = new Schema({
    mealplaneId: { type: Schema.ObjectId, ref: "mealplane" },
    count: { type: Number }
}, { timestamps: false, _id: false })

var addOnSchema = new Schema({
    addonId: { type: Schema.ObjectId, ref: "addon" },
    count: { type: Number }
}, { timestamps: false, _id: false })

var orderSummarySchema = new Schema({
    mealPlan: [mealPlanSchema],
    addOns: [addOnSchema]
}, { timestamps: false, _id: false });

// var deliveryDetailsSchema = new Schema({
//     subscriptionId: { type: Schema.ObjectId },
//     deliveryShift: { type: String },
//     deliveryTime: { type: String },
//     deliveryTo: { type: String },
//     deliveryInstruction: { type: String }
// }, { timestamps: false, _id: false });

var deliveryDetailsSchema = new Schema({
    subscriptionId: { type: Schema.ObjectId, ref: "subscription" },
    deliveryShift: { type: String },
    deliveryTime: { type: String },
    deliveryTo: {
        address: { type: String },
        lat: { type: Number },
        long: { type: Number }
    },
    deliveryInstruction: { type: String }
}, { timestamps: false, _id: false });

var paymentDetailsSchema = new Schema({
    totalPayment: { type: String },
    promotionCode: { type: String },
    paymentMethod: { type: String }
}, { timestamps: false, _id: false });

var orderSchema = new mongoose.Schema({
    // orderId: { type: Number },
    orderId: { type: String },
    orderSummary: [orderSummarySchema],
    deliveryDetails: [deliveryDetailsSchema],
    paymentDetails: [paymentDetailsSchema],
    status: { type: String }
}, { timestamps: true });

const Order = mongoose.model("order", orderSchema);

function validateOrder(order) {

    const schema = Joi.object({
        // orderId: Joi.number().required(),
        orderSummary: Joi.object({
            mealPlan: Joi.array().items({
                mealplaneId: Joi.objectId().required(),
                count: Joi.number().required()
            }).required(),
            addOns: Joi.array().items({
                addonId: Joi.objectId().required(),
                count: Joi.number().required()
            }).required()
        }).required(),
        deliveryDetails: Joi.object({
            subscriptionId: Joi.objectId().required(),
            deliveryShift: Joi.string().min(3).required(),
            deliveryTime: Joi.string().min(3).required(),
            deliveryTo: Joi.object({
                address:Joi.string().min(10).required(),
                lat:Joi.number().required(),
                long:Joi.number().required()
            }).required(),
            deliveryInstruction: Joi.string().min(3)
        }).required(),
        paymentDetails: Joi.object({
            totalPayment: Joi.number().required(),
            promotionCode: Joi.string().required(),
            paymentMethod: Joi.string().required()
        }).required(),
        status: Joi.string().required()
    })

    return schema.validate(order)
}

exports.Order = Order
exports.validate = validateOrder