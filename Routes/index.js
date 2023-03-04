var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function(req, res) {
	res.send('EatCoast Backend is Running');
});

module.exports = router;
