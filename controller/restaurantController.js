const RestaurantModel = require('../models/restaurant');


exports.getRestaurant = async (req, res) => {
     try {
          let data = await RestaurantModel.find({ owner: req.user._id }).lean().exec();
          if (data) {
               return res.status(200).json({ status: true, data });
          }
          else {
               return res.status(500).json({ status: false, message: "Restaurants not found." });
          }
     } catch (err) {
          return res.status(500).json({ status: false, message: err.message });
     };
};

exports.addRestaurant = async (req, res) => {
     try {
          if (req.file == undefined) {
               res.status("404").json({ message: "Image is Required" });
          }
          let check = await RestaurantModel.findOne({ name: req.body.name }).lean().exec();
          if (check && check.area.toLowerCase() == req.body.area.toLowerCase() && check.city.toLowerCase() == req.body.city.toLowerCase()) {
               return res.status(500).json({ status: false, message: "Restaurant Already Exists With this Name  in same area and city" });
          }
          else {
               await new RestaurantModel({
                    name: req.body.name,
                    owner: req.user._id,
                    address: req.body.address,
                    area: req.body.area,
                    city: req.body.city,
                    lat: req.body.lat,
                    lng: req.body.lng,
                    note: req.body.note,
                    state: req.body.state,
                    country: req.body.country,
                    zipCode: req.body.zipCode,
                    image: req.file.filename,
               }).save();
               return res.status(200).json({ status: true, message: "Restaurant Registered Successfully" });
          }

     } catch (err) {
          return res.status(500).json({ status: false, message: err.message });
     };
};

exports.updateRestaurant = async (req, res) => {
     try {
          const id = req.params.id
          const restaurant = await RestaurantModel.find({ _id: id })
          console.log(req.body, restaurant)
          await RestaurantModel.findOneAndUpdate({ _id: id }, { ...req.body, image: req.file.filename ? req.file.filename : restaurant.image }).exec()
          return res.status(200).json({ status: true, message: "Restaurant Details Updated Successfully" });
     } catch (err) {
          return res.status(500).json({ status: false, message: err.message });
     }
};

exports.deleteRestaurant = async (req, res) => {
     try {
          if (!req.body.id) {
               return res.status(404).json({ status: false, message: "Restaurant id is Necessary" });
          }

          await RestaurantModel.findOneAndDelete({ _id: req.body.id }).exec()
          return res.status(200).json({ status: true, message: "Restaurant Delete Successfully" });
     } catch (err) {
          return res.status(500).json({ status: false, message: err.message });
     }
};

exports.searchRestaurant = async (req, res) => {
     try {
          let data = await RestaurantModel.find({ name: { '$regex': req.body.restaurant, "$options": "i" } }).lean().exec();
          return res.status(200).json({ status: true, message: "Restaurant", data });
     } catch (err) {
          return res.status(500).json({ status: false, message: err.message });
     }
};

exports.restaurantWRTId = async (req, res) => {
     try {
          let data = await RestaurantModel.findOne({ _id: req.params.id }).lean().exec();
          return res.status(200).json({ status: true, message: "Restaurant", data });
     } catch (err) {
          return res.status(500).json({ status: false, message: err.message });
     }
};

exports.restaurantById = async (req, res) => {
     try {
          let data = await RestaurantModel.findOne({ owner: req.params.id }).lean().exec();
          return res.status(200).json({ status: true, message: "Restaurant", data });
     } catch (err) {
          return res.status(500).json({ status: false, message: err.message });
     }
}