const express = require('express');
const auth = require('../middleware/jwt');
const {addBalance} = require('../controllers/walletController');

const router = express.Router();

router.route('/add/balance').post(auth,addBalance);

module.exports = router;