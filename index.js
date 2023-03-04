var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
var indexRouter = require("./Routes/index");
var apiRouter = require("./Routes/api");
// require("./controller/cron")();
var cors = require("cors");

// DB connection
// var MONGODB_URL = process.env.NODE_ENV == "localhost"?"mongodb://localhost:27017/eatcoast":process.env.MONGODB_URL;
var MONGODB_URL = process.env.MONGODB_URL;

var mongoose = require("mongoose");
mongoose.connect(MONGODB_URL).then(() => {
	//don't show the log when it is test
	if(process.env.NODE_ENV !== "test") {
		console.log("Connected to %s", MONGODB_URL);
		console.log("Server is running ... \n");
		console.log("Press CTRL + C to stop the process. \n");
	}
})
	.catch(err => {
		console.error("App starting error:", err.message);
		process.exit(1);
	});

var app = express();

//don't show the log when it is test
if(process.env.NODE_ENV !== "test") {
	app.use(logger("dev"));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/image",express.static("public"))
// app.use(express.static(path.join(__dirname, "public")));


//To allow cross-origin requests
app.use(cors());

//Route Prefixes
app.use("/", indexRouter);
app.use("/api/", apiRouter);

// throw 404 if URL not found
app.all("*", function(req, res) {
	return res.status(404).json({ status: false, message:"Page not found"});
});

app.listen(process.env.PORT || "5055",()=>{
	console.log("App is Running on Port 5055")
})
