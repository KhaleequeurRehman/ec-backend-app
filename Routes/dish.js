const express = require('express');
const auth = require('../middleware/auth');
const multer = require("multer");
const DishController = require('../controller/dishController');

const storage = multer.diskStorage({
     destination: (req, file, cb) => {
         cb(null, "./public/dishImages");
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

router.route('/add').post(auth,upload,DishController.addDish);
router.route('/update').post(auth,upload,DishController.updateDish);
router.route('/delete').post(auth,DishController.deleteDish);
router.route('/search').post(DishController.searchWRTdish);
router.route('/mealcourse').post(DishController.allDishWRTMealCourse);
router.route('/addones').post(DishController.allDishWRTaddOnes);
router.route('/favourite').post(auth,DishController.favourite);
router.route('/rating').post(auth,DishController.ratings);
router.route('/:id').get(DishController.dishWRTid);
module.exports = router;