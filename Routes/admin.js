const express = require('express');
const auth = require('../middleware/auth');

const AuthController = require('../controller/authController');
const SubController = require('../controller/subscrptionController');
const CuisineController = require('../controller/cuisineController');
const UserRoleController = require("../controller/userRoleController")
const NoteController = require('../controller/NoteController.js');
const router = express.Router();





router.route('/register').post(auth,AuthController.registerAdmin);
router.route('/login').post(AuthController.loginAdmin);
router.route('/forgot/password').post(AuthController.forgetPasswordAdmin);
router.route('/verify/otp').post(AuthController.otpVerificationAdmin);
router.route('/delete').post(auth,AuthController.deleteAdmin);
router.route('/analytics').get(AuthController.analytics);
router.route('/add/gift/card').post(auth,AuthController.AddGiftCards);

//User Roles Related Routes
router.route('/add/role').post(auth,UserRoleController.addUserRole);
router.route('/update/role/:id').post(auth,UserRoleController.editUserRole);
router.route('/delete/role/:id').post(auth,UserRoleController.deleteUserRoles);
router.route('/get/roles').get(auth,UserRoleController.getAllUserRole);

router.route('/add/promotion').post(auth,AuthController.AddPromotions);
router.route('/add/discount').post(auth,AuthController.AddDiscount);
router.route('/update/gift/card').post(auth,AuthController.UpdateGiftCards);
router.route('/update/promotion').post(auth,AuthController.UpdatePromotions);
router.route('/update/discount').post(auth,AuthController.UpdateDiscount);
router.route('/delete/gift/card').post(auth,AuthController.deleteGiftCard);
router.route('/delete/promotion').post(auth,AuthController.deletePromotion);
router.route('/delete/discount').post(auth,AuthController.deleteDiscount);
router.route('/sub/single/order').post(SubController.getSingleSubscriptionOfAllUsers);
router.route('/sub').post(SubController.getSubscriptionOfAllUsers);
router.route('/sub/history').post(SubController.getSubscriptionHistory);
router.route('/sub/details').post(SubController.getSubscriptionDetails);
router.route('/sub/search').post(SubController.searchSubscription);
router.route('/sub/history/search').post(SubController.searchSubscriptionHistory);
router.route('/sub/filter/status').post(SubController.getSubscriptionsByStatus);
router.route('/all/customer').post(auth,AuthController.allUser);
router.route('/all/customers').post(auth,AuthController.getAllCustomers);
router.route('/all/customers/filter').post(auth,AuthController.getAllCustomersByStatus);
// router.route('/all/customer/search').post(auth,AuthController.searchUser);
router.route('/customer/details').post(auth,AuthController.customerDetails);
router.route('/update/customer').post(auth,AuthController.updateByAdmin);
router.route('/delete/customer').post(auth,AuthController.deleteByAdmin);
router.route('/filter/customer').post(SubController.filterSubscription);
router.route('/personal/customer').post(auth,AuthController.customerpersonalDetails);
router.route('/financial/customer').post(auth,AuthController.customerFinancialDetails);


//Admin Notes Related Routes
router.route('/note').post(auth,NoteController.makeNote);
router.route('/note/update').put(auth,NoteController.updateNote);
router.route('/note/delete').delete(auth,NoteController.deleteNote);
router.route('/get/notes').get(auth,NoteController.getAllNotes);
router.route('/get/notes/user').get(auth,NoteController.getNotesByUserId);

module.exports = router;