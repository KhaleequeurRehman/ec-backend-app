const CuisineModel = require('../models/cuisine');
var ObjectId = require("mongodb").ObjectId;

exports.add = async (req, res) => {
     try {
          if (!req.body.cuisine || !req.body.subCuisine) {
               return res.status(404).json({ status: false, message: "Cuisine or Sub Cuisine not defined" });
          }
          if (req.file == undefined) {
               res.status("404").json({ message: "Image is Required" });
          }
          else {
               if (!req.file) {
                    return apiResponse.ErrorResponse(res, "Image format not supported");
               } else {
                    let check = await CuisineModel.find({ cuisine: { '$regex': '^' + req.body.cuisine + '$', "$options": "i" }, subcuisine: { '$regex': '^' + req.body.subcuisine + '$', "$options": "i" } }).lean().exec();
                    if (check && check.length > 0) {
                         return res.status(404).json({ status: false, message: "Already Exists" });
                    }
                    else {
                         await new CuisineModel({
                              cuisine: req.body.cuisine,
                              subCuisine: req.body.subCuisine,
                              // image: `https://backend.eatcoast.ca/v1/image/${req.file.filename}`,
                              image: req.file.filename,
                              active: true
                         }).save();
                         return res.status(200).json({ status: true, message: "New Cuisine Added successfully" });
                    }
               }
          }
     } catch (err) {
          return res.status(500).json({ status: false, message: err.message });
     }
};

exports.update = async (req, res) => {
     try {
          if (!req.body.id) {
               return res.status(404).json({ status: false, message: "Id is required." });
          }
          else {
               if (req.file == undefined) {
                    if (req.body.image) {
                         delete req.body.image;
                    }
                    await CuisineModel.findOneAndUpdate({ _id: req.body.id }, req.body).exec();
                    return res.status(200).json({ status: true, message: "Updated successfully" });
               }
               else {
                    if (req.body.image) {
                         delete req.body.image;
                         Object.assign(req.body, { image: req.file.filename })
                    }
                    else {
                         Object.assign(req.body, { image: req.file.filename })
                    }
                    await CuisineModel.findOneAndUpdate({ _id: req.body.id }, req.body).exec();
                    return res.status(200).json({ status: true, message: "Updated successfully" });
               }
          }

     } catch (err) {
          return res.status(500).json({ status: false, message: err.message });
     }
};

exports.delete = async (req, res) => {
     try {
          if (!req.body.id) {
               return res.status(404).json({ status: false, message: "Id is required." });
          }
          let check = await CuisineModel.findOneAndDelete({ _id: req.body.id, owner: req.user._id }).exec();
          if (!check) {
               return res.status(404).json({ status: false, message: "Not Found" });
          }
          else {
               await CuisineModel.findOneAndDelete({ _id: req.body.id }).exec();
               return res.status(200).json({ status: true, message: "Cuisine Deleted Successfully" });
          }

     } catch (err) {
          return res.status(500).json({ status: false, message: err.message });
     }
};

exports.all = async (req, res) => {
     try {
          let data = await CuisineModel.aggregate([
               {
                    $lookup: {
                         from: "mealplanes", // collection to
                         let: { id: "$_id", owner: ObjectId(req.user._id) },
                         pipeline: [
                              {
                                   $match:
                                   {
                                        $expr:
                                        {
                                             $and:
                                                  [{ $eq: ["$cuisine", "$$id"] }, { $eq: ["$owner", "$$owner"] }]
                                        }
                                   }
                              }
                         ],
                         as: "mealplane"// output array field
                    }
               },
               { $addFields: { totalMenu: { $size: "$mealplane" } } },
               { $group: { _id: "$cuisine", subCuisine: { $push: "$$ROOT" } } },
               { $project: { "Cuisine": "$_id", _id: 0, subCuisine: 1 } },
               { $project: { "subCuisine.mealplane": 0, "subCuisine.owner": 0 } }
          ]).exec();

          return res.status(200).json({ status: true, message: "All Cuisine", data });
     } catch (err) {
          return res.status(500).json({ status: false, message: err.message });
     }
};

exports.get = async (req, res) => {
     try {
          let page = parseInt(req.body.page);
          let limit = parseInt(req.body.size);
          const sortBy = req.body.sortBy
          const orderBy = req.body.orderBy
          let data;
          let totalCuisinesCount;

          if(!req.body.status){
               return res.status(404).json({ status: false, message:"status is required"});
          }

          if(req.body.status?.toLocaleLowerCase() === "all"){
               totalCuisinesCount = await CuisineModel.countDocuments({}).exec();
               data = await CuisineModel.aggregate([
                    {
                         $lookup: {
                              from: "mealplanes", // collection to
                              let: { id: "$_id" },
                              pipeline: [
                                   {
                                        $match:
                                        {
                                             $expr:
                                             {
                                                  $and:
                                                       [{ $eq: ["$cuisine", "$$id"] }]
                                             }
                                        }
                                   }
                              ],
                              as: "mealplane"// output array field
                         }
                    },
                    { $addFields: { noOfMenu: { $size: "$mealplane" } } },
                    { $project: { "mealplane": 0, "updatedAt": 0, "createdAt": 0, "__v": 0 } },
                    { $skip: (page - 1) * limit },
                    { $limit: limit },
               ]).sort(`${orderBy === "desc" ? "-" : ""}${sortBy}`).exec();
          }else{
               // totalCuisinesCount = await CuisineModel.countDocuments({active:Boolean(req.body.status)}).exec();
               totalCuisinesCount = await CuisineModel.countDocuments({active:req.body.status === "true"? true :req.body.status === "false"? false : ""}).exec();
               data = await CuisineModel.aggregate([
                    {
                         // $match:{active:req.body.status}},
                         $match:{active:req.body.status === "true"? true :req.body.status === "false"? false : ""}},
                         {$lookup: {
                              from: "mealplanes", // collection to
                              let: { id: "$_id" },
                              pipeline: [
                                   {
                                        $match:
                                        {
                                             $expr:
                                             {
                                                  $and:
                                                       [{ $eq: ["$cuisine", "$$id"] }]
                                             }
                                        }
                                   }
                              ],
                              as: "mealplane"// output array field
                         }
                    },
                    { $addFields: { noOfMenu: { $size: "$mealplane" } } },
                    { $project: { "mealplane": 0, "updatedAt": 0, "createdAt": 0, "__v": 0 } },
                    { $skip: (page - 1) * limit },
                    { $limit: limit },
               ]).sort(`${orderBy === "desc" ? "-" : ""}${sortBy}`).exec();
          }
          return res.status(200).json({ status: true, message: "All Cuisine", data,totalCuisinesCount });
     } catch (err) {
          return res.status(500).json({ status: false, message: err.message });
     }
};

//admin

exports.allMealPlanWRTCuisine = async (req, res) => {
     try {
          let page = parseInt(req.body.page);
          let limit = parseInt(req.body.size);
          let data = await CuisineModel.aggregate([
               {
                    $lookup: {
                         from: "mealplanes", // collection to
                         let: { id: "$_id" },
                         pipeline: [
                              {
                                   $match:
                                   {
                                        $expr:
                                        {
                                             $and:
                                                  [{ $eq: ["$cuisine", "$$id"] }]
                                        }
                                   }
                              }
                         ],
                         as: "mealplane"// output array field
                    }
               },
               { $unwind: "$mealplane" },
               {
                    $lookup: {
                         from: "caterers", // collection to
                         let: { id: "$mealplane.owner" },
                         pipeline: [
                              {
                                   $match:
                                   {
                                        $expr:
                                        {
                                             $and:
                                                  [{ $eq: ["$_id", "$$id"] }]
                                        }
                                   }
                              },
                              { $project: { "merchantName": 1 } }
                         ],
                         as: "caterer"// output array field
                    }
               },
               {
                    $addFields: {
                         menuName: "$mealplane.name",
                         caterer: { $first: "$caterer.merchantName" },
                         startDate: "$mealplane.createdAt",
                         endDate: "$mealplane.endDate",
                         status: "$mealplane.reviewStatus",
                         mealplaneId: "$mealplane._id",
                    }
               },
               { $skip: (page - 1) * limit },
               { $limit: limit },
               { $project: { "mealplane": 0, "updatedAt": 0, "createdAt": 0, "noOfMenu": 0, "__v": 0 } }
          ]).exec();

          return res.status(200).json({ status: true, message: "All Cuisine", data });
     } catch (err) {
          return res.status(500).json({ status: false, message: err.message });
     }
};

exports.searchCuisine = async (req, res) => {
     try {
          const data = await CuisineModel.find({ cuisine: { $regex: '^' + req.body.search, $options: 'i' } }).lean().exec();
          return res.status(200).json({ status: true, message: "success", data });
     } catch (error) {
          res.status(500).json({ success: false, message: "something went wrong", error: error.toString() });
     }
}

exports.searchSubCuisine = async (req, res) => {
     try {
          const data = await CuisineModel.find({ subCuisine: { $regex: '^' + req.body.search, $options: 'i' } }).lean().exec();
          return res.status(200).json({ status: true, message: "success", data });
     } catch (error) {
          res.status(500).json({ success: false, message: "something went wrong", error: error.toString() });
     }
}