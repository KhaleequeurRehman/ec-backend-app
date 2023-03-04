const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const EmailController = require('../controller/sendEmail');
const multer = require("multer");

const storage = multer.diskStorage({
     destination: (req, file, cb) => {
         cb(null, "./public/email");
     },
     filename: (req, file, cb) => {
         cb(null, Date.now() + file.originalname);
     }
 });
 
 
const fileFilter = (req, file, cb) => {
     if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/heif" || file.mimetype == "image/heic") {
         cb(null, true);
     } else {
         cb(null, false);
     }
 };
 
const upload = multer({storage: storage, fileFilter: fileFilter}).array('image', 20)

router.route('/compose').post(auth,upload,EmailController.compose);
router.route('/sent').post(auth,EmailController.sent);
router.route('/inbox').post(auth,EmailController.inbox);
router.route('/draft').post(auth,EmailController.draft);
router.route('/trash').post(auth,EmailController.trash);
router.route('/important').post(auth,EmailController.important);
router.route('/starred').post(auth,EmailController.starred);
router.route('/update').post(auth,EmailController.update);
router.route('/delete').post(auth,EmailController.delete);
router.route('/delete/many').post(auth,EmailController.deleteAll);
module.exports = router;