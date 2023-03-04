const jwt = require("express-jwt");
const secret = process.env.JWT_SECRET_KEY;

const authenticate = jwt({
	secret: secret
});

module.exports = authenticate;