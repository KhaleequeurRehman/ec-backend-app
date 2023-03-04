const express = require('express');
const auth = require('../middleware/auth');
const CuisineContoller = require('../controller/cuisineController');
const multer = require("multer");

const storage = multer.diskStorage({
     destination: (req, file, cb) => {
         cb(null, "./public/cuisineImages");
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

const router = express.Router();

router.route('/').post(CuisineContoller.get);
router.route('/add').post(auth,upload,CuisineContoller.add);
router.route('/update').post(auth,upload,CuisineContoller.update);
router.route('/delete').post(auth,CuisineContoller.delete);
router.route('/get').get(auth,CuisineContoller.all);
router.route('/details/mealplan').post(CuisineContoller.allMealPlanWRTCuisine);
router.route('/search').post(CuisineContoller.searchCuisine);
router.route('/search/subcuisine').post(CuisineContoller.searchSubCuisine);
module.exports = router;