const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const PaymentController = require('../controller/paymentController');


router.route('/add/:type').post(auth,PaymentController.addCard);
router.route('/update/:type').post(auth,PaymentController.updateCard);
router.route('/charge/:type').post(auth,PaymentController.CutPayment);

module.exports = router;