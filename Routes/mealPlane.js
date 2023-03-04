const express = require('express');
const auth = require('../middleware/auth');
const MealPlaneController = require('../controller/mealPlaneController');
const multer = require("multer");
const router = express.Router();


const storage = multer.diskStorage({
     destination: (req, file, cb) => {
         cb(null, "./public/mealplane");
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

router.route('/add').post(auth,upload,MealPlaneController.add);
router.route('/add/dish/mealcourse').post(auth,MealPlaneController.addDishToMealCourse);
router.route('/delete/dish/mealcourse').post(auth,MealPlaneController.deleteDishToMealCourse);
router.route('/update').post(auth,upload,MealPlaneController.update);
router.route('/delete').post(auth,MealPlaneController.delete);
router.route('/get').get(auth,MealPlaneController.all);
router.route('/get/all').post(auth,MealPlaneController.getAllMealplans);
router.route('/filter').post(auth,MealPlaneController.filterMealplansWithStatus);
router.route('/update/status').put(auth,MealPlaneController.updateMealplanStatus);
router.route('/disable').post(auth,MealPlaneController.disableMealplan);
router.route('/cuisine').post(auth,MealPlaneController.wrtCuisine);
router.route('/detail').post(MealPlaneController.WrtId);
router.route('/caterer').post(MealPlaneController.WrtCatererId);
router.route('/search').post(MealPlaneController.search);
module.exports = router;






// const express = require('express');
// const auth = require('../middleware/auth');
// const MealPlaneController = require('../controller/mealPlaneController');
// const multer = require("multer");
// const router = express.Router();

// const storage = multer.diskStorage({
//      destination: (req, file, cb) => {
//          cb(null, "./public/mealplane");
//      },
//      filename: (req, file, cb) => {
//          cb(null, Date.now() + file.originalname);
//      }
//  });
 
 
//  const fileFilter = (req, file, cb) => {
//      if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/heif" || file.mimetype == "image/heic") {
//          cb(null, true);
//      } else {
//          cb(null, false);
//      }
//  };
 
//  const upload = multer({storage: storage, fileFilter: fileFilter}).single("image");

// router.route('/add').post(auth,upload,MealPlaneController.add);
// router.route('/add/dish/mealcourse').post(auth,MealPlaneController.addDishToMealCourse);
// router.route('/delete/dish/mealcourse').post(auth,MealPlaneController.deleteDishToMealCourse);
// router.route('/update').post(auth,upload,MealPlaneController.update);
// router.route('/delete').post(auth,MealPlaneController.delete);
// router.route('/get').get(auth,MealPlaneController.all);
// router.route('/cuisine').post(auth,MealPlaneController.wrtCuisine);
// router.route('/detail').post(MealPlaneController.WrtId);
// router.route('/caterer').post(MealPlaneController.WrtCatererId);
// router.route('/search').post(MealPlaneController.search);
// module.exports = router;