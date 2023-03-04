const express = require('express');
const auth = require('../middleware/auth');
const AuthController = require('../controller/authController');
const CatererController = require('../controller/cartererController');
const multer = require('multer');

const router = express.Router();

const storage = multer.diskStorage({
     destination: (req, file, cb) => { 
        if (file.fieldname == "certificate") {
            cb(null, './public/caterer/certificates/')
        }
        else if (file.fieldname == "licence") {
            cb(null, './public/caterer/licences/');
        }
     },
     filename:(req,file,cb)=>{
          console.log(file)
          if (file.fieldname === "certificate") {
               let mimeType = file.mimetype.split("/");
               mimeType = mimeType.pop()
               cb(null, Date.now()+ "."+mimeType);
          }
          else if (file.fieldname === "licence") {
               let mimeType = file.mimetype.split("/");
               mimeType = mimeType.pop()
               cb(null, Date.now()+ "."+mimeType);
          }
     }
 });
 
 
 const fileFilter = (req, file, cb) => {
    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/heif" || file.mimetype == "image/heic") {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
 
 const upload= multer({
     storage: storage,
     fileFilter: fileFilter}).fields([{name:'certificate', maxCount:1}, {name: 'licence', maxCount:1}
]);

router.route('/signup').post(AuthController.signUp);
router.route('/signup/driver').post(AuthController.signUpDriver);
router.route('/signup/caterer').post(upload,CatererController.signUpCaterer);
router.route('/email/verify/caterer').post(CatererController.EmailVerificationCaterer);
router.route('/forgot/password/caterer').post(CatererController.forgetPasswordCarter);
router.route('/verify/otp/caterer').post(CatererController.otpVerificationCatererForgotPassword);
router.route('/login/caterer').post(CatererController.loginCarter);
router.route('/login/verify/caterer').post(CatererController.otpVerificationCatererLogin);

router.route('/update/caterer/document/:catererID').post(upload,CatererController.updateCatererDocument);

router.route('/password/less/login').post(AuthController.passwordLessLogin);
router.route('/login/driver').post(AuthController.loginDriver);
router.route('/phonecheck').post(AuthController.phoneCheck);
router.route('/changePassword').post(auth,AuthController.changePassword);
router.route('/update').post(auth,AuthController.update);
router.route('/dash').get(auth,AuthController.dash);
router.route('/address/add').post(auth,AuthController.addAddress);
router.route('/address/update').post(auth,AuthController.updateAddress);
router.route('/address/delete').post(auth,AuthController.deleteAddress);
router.route('/use/discount').post(auth,AuthController.usedDiscount);
router.route('/use/gift/card').post(auth,AuthController.usedGiftCard);
router.route('/use/promotion').post(auth,AuthController.usedPromotion);
router.route('/customer/search').post(AuthController.search);

module.exports = router;