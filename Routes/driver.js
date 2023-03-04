const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const DriverController = require('../controller/driverController');


router.route('/').post(auth,DriverController.getDriver);
router.route('/update/status').post(auth,DriverController.updateDriverStatus);
router.route('/details').post(auth,DriverController.driverDetails);
router.route('/financial').post(auth,DriverController.driverDetailsFinance);
router.route('/details/subscription').post(auth,DriverController.allDriverSubscription);
router.route('/make/adjustment').post(auth,DriverController.makeAdjustment);
router.route('/make/adjustment/details').post(auth,DriverController.getmakeAdjustmentDetails);
router.route('/search').post(DriverController.search);
router.route('/filter/status').post(DriverController.getDriverWRTStatus);

module.exports = router;