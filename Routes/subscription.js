const express = require('express');
const auth = require('../middleware/auth');
const {getSubscription,addSubscription,updateSubscription,updateSubscriptionStatus} = require('../controller/subscrptionController');

const router = express.Router();

router.route('/').get(auth,getSubscription);
router.route('/add').post(auth,addSubscription);
router.route('/update').post(auth,updateSubscription);
router.route('/:status').post(auth,updateSubscriptionStatus);

module.exports = router;