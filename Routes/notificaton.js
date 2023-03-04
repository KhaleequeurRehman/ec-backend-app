const express = require('express');
const auth = require('../middleware/auth');
let notificationController = require("../controller/notification");
const multer = require("multer");
const router = express.Router();

const storage = multer.diskStorage({
     destination: (req, file, cb) => {
         cb(null, "./public/notification");
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
 
const upload = multer({storage: storage, fileFilter: fileFilter}).single("image");

router.route('/send').post(auth,upload,notificationController.send);
// router.route('/history').get(auth,notificationController.history);
// router.route('/history/:to').get(auth,notificationController.getBy);
router.route('/history').post(auth,notificationController.history);
router.route('/history/:to').post(auth,notificationController.getBy);

module.exports = router;