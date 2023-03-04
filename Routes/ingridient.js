const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const Ingridient = require('../controller/ingridientController');
const multer = require("multer");

const storage = multer.diskStorage({
     destination: (req, file, cb) => {
         cb(null, "./public/IngridientImages");
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
router.route('/').post(upload,Ingridient.addIngridient);
module.exports = router;