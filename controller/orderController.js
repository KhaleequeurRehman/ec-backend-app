const { Order, validate } = require("../models/order")

exports.makeOrder = async (req, res) => {
    try {
        const { error } = validate({ ...req.body, status: "request" });
        if (error) return res.status(400).send(error.details[0].message);
        console.log("req.body", req.body)
        const resData = new Order({
            orderId: "EC - order-" + Math.floor(Math.random() * 10),
            orderSummary: req.body.orderSummary,
            deliveryDetails: req.body.deliveryDetails,
            paymentDetails: req.body.paymentDetails,
            status: "request"
        })

        await resData.save()

        console.log(resData)
        return res.status(200).json({ status: true, message: "New order created successfully" });
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
}

exports.getAllOrderRelatedToCustomer = async (req, res) => {
    try {

        if (!req.params.subscriptionId) {
            return res.status(404).json({ status: true, message: "subscriptionId is required" });
        }

        let subscriptionId = req.params.subscriptionId;
        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.size);
        const sortBy = req.query.sortBy
        const orderBy = req.query.orderBy

        // const orderRes = await Order.find({ "deliveryDetails.subscriptionId": subscriptionId }).skip((page - 1) * limit).limit(limit).sort(`${orderBy === "desc" ? "-" : ""}${sortBy}`)
        const orderRes = await Order.find({ "deliveryDetails.subscriptionId": subscriptionId }).populate({
            path: "deliveryDetails.subscriptionId",
            model:"subscription",
            populate: {path:"user",model: "user"}
        }).skip((page - 1) * limit).limit(limit).sort(`${orderBy === "desc" ? "-" : ""}${sortBy}`)
                // return res.status(200).send(orderRes)
                return res.status(200).json({ status: true, message: "All Orders", data:orderRes })
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
}

exports.getAllOrder = async (req, res) => {
    try {
        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.size);
        const sortBy = req.query.sortBy
        const orderBy = req.query.orderBy

        const orderRes = await Order.find({}).populate({
            path: "deliveryDetails.subscriptionId",
            model:"subscription",
            populate: {path:"user",model: "user"}
        }).populate({
            path: "deliveryDetails.subscriptionId",
            model:"subscription",
            populate: {path:"caterer",model: "caterer"}
        }).populate({
            path: "deliveryDetails.subscriptionId",
            model:"subscription",
            populate: {path:"driver",model: "driver"}
        }).skip((page - 1) * limit).limit(limit).sort(`${orderBy === "desc" ? "-" : ""}${sortBy}`)

        // return res.status(200).send(orderRes)
        return res.status(200).json({ status: true, message: "All Orders", data:orderRes })
        
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
}


exports.getSingleOrder = async (req, res) => {
    try {

        if (!req.params.id) {
            return res.status(404).json({ status: true, message: "id is required" });
        }

        const orderRes = await Order.findOne({_id:req.params.id}).populate({
            path: "deliveryDetails.subscriptionId",
            model:"subscription",
            populate: {path:"user",model: "user"}
        }).populate({
            path: "deliveryDetails.subscriptionId",
            model:"subscription",
            populate: {path:"caterer",model: "caterer"}
        }).populate({
            path: "deliveryDetails.subscriptionId",
            model:"subscription",
            populate: {path:"driver",model: "driver"}
        })

        // return res.status(200).send(orderRes)
        return res.status(200).json({ status: true, message: "Your Order", data:orderRes })
        
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
}