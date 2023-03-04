const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const feedBack = require('../controller/feedBackController');


router.route('/').get(auth,feedBack.getAllFeedback);
router.route('/add').post(auth,feedBack.postFeedback);

module.exports = router;