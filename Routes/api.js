var express = require("express");
// V1
var authRouter = require("./auth");
var subcriptionRouter = require("./subscription");
var adminRouter = require("./admin");
var dishRouter = require("./dish");
var restaurantRouter = require("./restaurant");
var catererRouter = require("./caterer");
var cuisineRouter = require("./cuisine");
var mealPlaneRouter = require("./mealPlane");
var driverRouter = require("./driver");
var NotifiactionRouter = require("./notificaton");
var CERouter = require("./contentEditor");
var EmailRouter = require("./email");
var PaymentController = require("./payment");
var orderRouter = require("./order");
var FeedBack = require("./feedBack")
var app = express();

//Controllers Routes V1 
app.use("/auth/", authRouter);
app.use("/order/", orderRouter);
app.use("/subcription/", subcriptionRouter);
app.use("/admin/", adminRouter);
app.use("/dish/", dishRouter);
app.use("/restaurant/", restaurantRouter);
app.use("/caterer/", catererRouter);
app.use("/customerfeedback/", FeedBack);
app.use("/cuisine/", cuisineRouter);
app.use("/mealplane/", mealPlaneRouter);
app.use("/driver/", driverRouter);
app.use("/notification/", NotifiactionRouter);
app.use("/content/editor/", CERouter);
app.use("/email/", EmailRouter);
app.use("/payment/", PaymentController);
module.exports = app;
