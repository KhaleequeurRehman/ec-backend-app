const express = require('express');
const auth = require('../middleware/auth');
const multer = require("multer");
const RestaurantController = require('../controller/restaurantController');

const storage = multer.diskStorage({
     destination: (req, file, cb) => {
         cb(null, "./public/restaurantImages");
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

router.route('/').get(auth,RestaurantController.getRestaurant);
router.route('/add').post(auth,upload,RestaurantController.addRestaurant);
router.route('/update/:id').post(auth,upload,RestaurantController.updateRestaurant);
router.route('/delete').post(auth,RestaurantController.deleteRestaurant);
router.route('/search').post(RestaurantController.searchRestaurant);
router.route('/:id').get(RestaurantController.restaurantWRTId);
router.route('/user/:id').get(RestaurantController.restaurantById);

module.exports = router;