const express = require('express');
const auth = require('../middleware/auth');
let CEController = require("../controller/contentEditor");
const multer = require("multer");
const router = express.Router();

const storage = multer.diskStorage({
     destination: (req, file, cb) => {
         cb(null, "./public/contentEditor");
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

router.route('/create').post(auth,upload,CEController.create);
router.route('/update').post(auth,upload,CEController.update);
router.route('/delete').post(auth,CEController.delete);
router.route('/search').post(CEController.search);
router.route('/publish').post(auth,CEController.getPublish);
router.route('/draft').post(auth,CEController.getDraft);

module.exports = router;