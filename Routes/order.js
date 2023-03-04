const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const OrderController = require('../controller/orderController');


router.route('/make').post(auth,OrderController.makeOrder);
router.route('/get/all').get(auth,OrderController.getAllOrder);
router.route('/get/detial/:id').get(auth,OrderController.getSingleOrder);
router.route('/get/:subscriptionId').get(auth,OrderController.getAllOrderRelatedToCustomer);

module.exports = router;