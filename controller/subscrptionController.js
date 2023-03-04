const SubscriptionModel = require('../models/subscription');
const UserModel = require('../models/user');
const CatererModel = require('../models/caterer');
const DriverModel = require('../models/driver');
const DishModel = require('../models/dish');
const MealPlaneModel = require('../models/mealPlane');
var ObjectId = require("mongodb").ObjectId;
var moment = require("moment-timezone");

exports.getSubscription = async (req, res) => {
  try{
     let data = await SubscriptionModel.findOne({user:req.user._id}).lean().exec();
     if(data){
          return res.status(200).json({ status: true, data});
     }
     else{
          return res.status(500).json({ status: false, message:"Subscription not found"});
     }
} catch (err) {
     return res.status(500).json({ status: false, message:err.message });
};
};

exports.addSubscription = async (req, res) => {
  try{
     let checkAddressId = await UserModel.findOne({user:req.user._id,deliveryAddress:req.body.deliveryAddress}).lean().exec();
     if(!checkAddressId){
          return res.status(500).json({ status: false, message:"Delivery address Id is not correct"});
     }
     else{
          let count = await SubscriptionModel.countDocuments().exec();
          await new SubscriptionModel({
               subId:"ECS - "+ parseInt(count+1),
               user:req.user._id,
               type:req.body.type,
               subType: req.body.subType,
               mealPlane: req.body.mealPlane,
               caterer: req.body.caterer,
               period: req.body.period,
               to: req.body.to,
               from: req.body.from,
               deliveryTime: req.body.deliveryTime,
               deliveryAddress: req.body.deliveryAddress,
               price: req.body.price,
               promotionCode: req.body.promotionCode,
               paymentMethod: req.body.paymentMethod,
               status: "request",
               scheduleDay: req.body.scheduleDay,
               category: req.body.category,
               type: req.body.type,
          }).save();
               return res.status(200).json({ status: true, message:"Subscription Request Sent Successfully"});
          
     }
} catch (err) {
     return res.status(500).json({ status: false, message:err.message });
};
};

exports.updateSubscription = async (req, res) => {
  try{
     if(!req.body.id){
          return res.status(404).json({ status: false, message:"Id or Subsciption Detail is missing"});
     }

     await SubscriptionModel.findOneAndUpdate({_id:req.body.id}, req.body).exec()
     return res.status(200).json({ status: true, message:"Subscription Updated Successfully"});
     } catch (err) {
     return res.status(500).json({ status: false, message:err.message });
  }
};

exports.updateSubscriptionStatus = async (req, res) => {
  try{
     let id = req.body.id;
     if(req.body.id){
          id = req.body.id;
     }
     else{
          id = req.user.id;
     }
     if(req.params.status == "pause"){
          delete req.body.id;
          await SubscriptionModel.findOneAndUpdate({_id:id},{pause: req.body}).exec();
          return res.status(200).json({ status: true, message:"Subscription "+req.params.status+" Successfully"});
     }
     else if(req.params.status == "cancel"){
          delete req.body.id;
          await SubscriptionModel.findOneAndUpdate({_id:id},{cancel: req.body}).exec();
          return res.status(200).json({ status: true, message:"Subscription "+req.params.status+" Successfully"});
     }
     else{
          return res.status(404).json({ status: false, message:"Page not found"});
     }
     } catch (err) {
     return res.status(500).json({ status: false, message:err.message });
  }
};

exports.acceptSubscriptionRequest = async (req, res) => {
     try{
          if(!req.body.id){
               return res.status(404).json({ status: false, message:"Id or Subsciption Detail is missing"});
          }
          
          await SubscriptionModel.findOneAndUpdate({_id:req.body.id},{status:"active",activeDate:new Date()}).exec();
          return res.status(200).json({ status: true, message:"Subscription active Successfully"});
        

        } catch (err) {
        return res.status(500).json({ status: false, message:err.message });
     }
   };

exports.cancelSubscriptionRequest = async (req, res) => {
     try{
          if(!req.body.id){
               return res.status(404).json({ status: false, message:"Id or Subsciption Detail is missing"});
          }
          await SubscriptionModel.findOneAndUpdate({_id:req.body.id},{"cancel":{reason: req.body.reason},status:"cancel"}).exec();
          return res.status(200).json({ status: true, message:"Subscription canceled Successfully"});

        } catch (err) {
        return res.status(500).json({ status: false, message:err.message });
     }
   };

// Admin
exports.getSubscriptionOfAllUsers= async (req, res) => {
     try{
          let personal = await SubscriptionModel.countDocuments({type:"personal",period:{$ne:"single"}}).exec();
          let business = await SubscriptionModel.countDocuments({type:"business",period:{$ne:"single"}}).exec();
          let multiple = await SubscriptionModel.countDocuments({type:"multiple",period:{$ne:"single"}}).exec();

          let totalSubscriptionCount = await SubscriptionModel.countDocuments({}).exec();
          
          let page = parseInt(req.body.page);
          let limit = parseInt(req.body.size);
          const sortBy = req.body.sortBy
          const orderBy = req.body.orderBy

          let data = await SubscriptionModel.aggregate([
               {$match:{}},
               // {$match:{subcriptionPeriod:{$ne:"single"}}},
               {$lookup: {
                from: "users", // collection to
                let: { id: "$user"},
                pipeline: [
                    { $match:
                            { $expr:
                                    { $and:
                                            [{ $eq: [ "$_id",  "$$id" ] }]
                                    }
                            }
                    },
                    {$project:{"fullName":1}}
                ],
                as: "User"// output array field
               }},
               
               {$lookup: {
                from: "caterers", // collection to
                let: { id: "$caterer"},
                pipeline: [
                    { $match:
                            { $expr:
                                    { $and:
                                            [{ $eq: [ "$_id",  "$$id" ] }]
                                    }
                            }
                    },
                    {$project:{"merchantName":1}}
                ],
                as: "caterer"// output array field
               }},
               { $addFields: { customerName: { $first: "$User.fullName" },caterer: { $first: "$caterer.merchantName" } } },
               {$project:{"type":1,"customerName":1,"caterer":1,"subId":1,"period":1,"deliveryTime":1,"status":1,"scheduleDay":1,createdAt :1}},
               { $skip : (page-1)*limit},
               { $limit : limit }
          ]).sort(`${orderBy === "desc" ? "-" : ""}${sortBy}`).exec();
        if(data){
             return res.status(200).json({ status: true, Details:{SubDetails:data,personal,business,multiple,totalSubscriptions:totalSubscriptionCount}});
        }
        else{
             return res.status(500).json({ status: false, message:"Subscription not found"});
        }
     } catch (err) {
        return res.status(500).json({ status: false, message:err.message });
     };
};


// Admin
exports.getSubscriptionHistory= async (req, res) => {
     try{
          
          let page = parseInt(req.body.page);
          let limit = parseInt(req.body.size);
          const sortBy = req.body.sortBy
          const orderBy = req.body.orderBy
          let data;
          let totalSubscriptionHistoryCount;

          if(!req.body.status){
               return res.status(404).json({ status: false, message:"status is required"});
          }

          // let data = await SubscriptionModel.aggregate([
          //      // {$match:{subcriptionPeriod:{$ne:"single"}}},
          //      {$match:{}},
          //      {$lookup: {
          //       from: "users", // collection to
          //       let: { id: "$user"},
          //       pipeline: [
          //           { $match:
          //                   { $expr:
          //                           { $and:
          //                                   [{ $eq: [ "$_id",  "$$id" ] }]
          //                           }
          //                   }
          //           },
          //           {$project:{"fullName":1}}
          //       ],
          //       as: "User"// output array field
          //      }},
               
          //      {$lookup: {
          //       from: "caterers", // collection to
          //       let: { id: "$caterer"},
          //       pipeline: [
          //           { $match:
          //                   { $expr:
          //                           { $and:
          //                                   [{ $eq: [ "$_id",  "$$id" ] }]
          //                           }
          //                   }
          //           },
          //           {$project:{"merchantName":1}}
          //       ],
          //       as: "caterer"// output array field
          //      }},
          //      { $addFields: { customerName: { $first: "$User.fullName" },caterer: { $first: "$caterer.merchantName" } } },
          //      {$project:{"type":1,"customerName":1,"caterer":1,"subId":1,"period":1,"deliveryTime":1,"status":1}},
          //      { $skip : (page-1)*limit},
          //      { $limit : limit }
          // ]).exec();

          if(req.body.status?.toLocaleLowerCase() === "all"){
               totalSubscriptionHistoryCount = await SubscriptionModel.countDocuments({}).exec();
               data = await SubscriptionModel.aggregate([
                    // {$match:{subcriptionPeriod:{$ne:"single"}}},
                    {$match:{}},
                    {$lookup: {
                     from: "users", // collection to
                     let: { id: "$user"},
                     pipeline: [
                         { $match:
                                 { $expr:
                                         { $and:
                                                 [{ $eq: [ "$_id",  "$$id" ] }]
                                         }
                                 }
                         },
                         {$project:{"fullName":1}}
                     ],
                     as: "User"// output array field
                    }},
                    
                    {$lookup: {
                     from: "caterers", // collection to
                     let: { id: "$caterer"},
                     pipeline: [
                         { $match:
                                 { $expr:
                                         { $and:
                                                 [{ $eq: [ "$_id",  "$$id" ] }]
                                         }
                                 }
                         },
                         {$project:{"merchantName":1}}
                     ],
                     as: "caterer"// output array field
                    }},
                    { $addFields: { customerName: { $first: "$User.fullName" },caterer: { $first: "$caterer.merchantName" } } },
                    {$project:{"type":1,"customerName":1,"caterer":1,"subId":1,"period":1,"deliveryTime":1,"status":1,createdAt :1}},
                    { $skip : (page-1)*limit},
                    { $limit : limit }
               ]).sort(`${orderBy === "desc" ? "-" : ""}${sortBy}`).exec();
          }else{
               totalSubscriptionHistoryCount = await SubscriptionModel.countDocuments({status:{ $regex:'^' + req.body.status, $options: 'i'}}).exec();
               data = await SubscriptionModel.aggregate([
                    {$match:{status:{ $regex:'^' + req.body.status, $options: 'i'}}},
                    {$lookup: {
                    from: "users", // collection to
                    let: { id: "$user"},
                    pipeline: [
                         { $match:
                              { $expr:
                                        { $and:
                                             [{ $eq: [ "$_id",  "$$id" ] }]
                                        }
                              }
                         },
                         {$project:{"fullName":1}}
                    ],
                    as: "User"// output array field
                    }},
                    
                    {$lookup: {
                    from: "caterers", // collection to
                    let: { id: "$caterer"},
                    pipeline: [
                         { $match:
                              { $expr:
                                        { $and:
                                             [{ $eq: [ "$_id",  "$$id" ] }]
                                        }
                              }
                         },
                         {$project:{"merchantName":1}}
                    ],
                    as: "caterer"// output array field
                    }},
                    { $addFields: { customerName: { $first: "$User.fullName" },caterer: { $first: "$caterer.merchantName" } } },
                    {$project:{"type":1,"customerName":1,"caterer":1,"subId":1,"period":1,"deliveryTime":1,"status":1,createdAt :1}},
                    { $skip : (page-1)*limit},
                    { $limit : limit }
               ]).sort(`${orderBy === "desc" ? "-" : ""}${sortBy}`).exec();
          }


        if(data){
             return res.status(200).json({ status: true, message:"Subscription History", data:data,totalSubscriptionHistoryCount:totalSubscriptionHistoryCount});
        }
        else{
             return res.status(500).json({ status: false, message:"Subscription History not found"});
        }
     } catch (err) {
        return res.status(500).json({ status: false, message:err.message });
     };
};


// Caterer
exports.getSubscriptionOfCaterer= async (req, res) => {
     try{
          let count = await SubscriptionModel.countDocuments({caterer: req.body.catererId}).lean().exec();
          let data = await SubscriptionModel.find({caterer: req.body.catererId},"subId quantity deliveryTime type").sort({createdAt:-1}).skip((parseInt(req.body.page) - 1) * parseInt(req.body.size)).limit(parseInt(req.body.size)).lean().exec();
          let totalPage = Math.ceil(count / parseInt(req.body.size));
          if(data){
               return res.status(200).json({ status: true, Details:{data:data,totalPage}});
          }
          else{
               return res.status(500).json({ status: false, message:"Subscription not found"});
          }
     } catch (err) {
        return res.status(500).json({ status: false, message:err.message });
     };
};

//Caterer
exports.getSubscriptionOfUsers= async (req, res) => {
     try{
          let query = {}
          if(req.params.status == "active"){
               query = {caterer:req.body.catererId,status:"active",$or:[{pause:{$exists:false}},{"pause.to":{$lt:new Date()}},{"pause.from":{$gt:new Date()}}]};
          }
          else if(req.params.status == "pause"){
               query = {caterer:req.body.catererId,status:"active",pause:{$exists:true},$and:[{"pause.to":{$gte:new Date()}},{"pause.from":{$lte:new Date()}}]};
          }
          else if(req.params.status == "history"){
               query = {caterer:req.body.catererId,status:"completed"};
          }
          else{
             query = {caterer:req.body.catererId,status:"active"};  
          }
          let count = await SubscriptionModel.countDocuments(query).lean().exec();
          let data = await SubscriptionModel.find(query,"from to subId type status pause mealPlane").sort({createdAt:-1}).skip((parseInt(req.body.page) - 1) * parseInt(req.body.size)).limit(parseInt(req.body.size)).lean().exec();
          let MP = await MealPlaneModel.find({owner: req.body.catererId},"name").lean().exec();

          if(data && data.length > 0){
               let totalPage = Math.ceil(count / parseInt(req.body.size));
               let subscriptions = [];
               for await(let sub of data){
                    let temp = {...sub};
                    let menu = [];

                    if(sub.mealPlane){
                         for await(let m of sub.mealPlane){
                              let filter = MP.filter(x=> x._id.valueOf() == m.mealPlanId.valueOf());
                              if(filter && filter.length > 0){
                                   menu.push(filter[0].name);
                              }
                         }
                    }
                    if(menu && menu.length < 0){
                         menu = ""
                    }
                    else{
                         mealPlane = mealPlane.toString()
                    }
                    temp.menu = menu;
                    delete temp.mealPlane;
                    subscriptions.push(temp)
               }
               return res.status(200).json({ status: true, Details:{data:subscriptions,totalPage}});
          }
          else{
               return res.status(500).json({ status: false, message:"Subscription not found"});
          }
     } catch (err) {
        return res.status(500).json({ status: false, message:err.message });
     };
};

exports.getSingleSubscriptionOfAllUsers= async (req, res) => {
     try{
          let personal = await SubscriptionModel.countDocuments({type:"personal",period:"single"}).exec();
          let business = await SubscriptionModel.countDocuments({type:"business",period:"single"}).exec();
          let multiple = await SubscriptionModel.countDocuments({type:"multiple",period:"single"}).exec();
          
          let page = parseInt(req.body.page);
          let limit = parseInt(req.body.size);

          let data = await SubscriptionModel.aggregate([
               {$match:{subcriptionPeriod:"single"}},
               {$lookup: {
                from: "users", // collection to
                let: { id: "$user"},
                pipeline: [
                    { $match:
                            { $expr:
                                    { $and:
                                            [{ $eq: [ "$_id",  "$$id" ] }]
                                    }
                            }
                    },
                    {$project:{"fullName":1}}
                ],
                as: "User"// output array field
               }},
               {$lookup: {
                from: "caterers", // collection to
                let: { id: "$orderFrom"},
                pipeline: [
                    { $match:
                            { $expr:
                                    { $and:
                                            [{ $eq: [ "$_id",  "$$id" ] }]
                                    }
                            }
                    },
                    {$project:{"merchantName":1}}
                ],
                as: "caterer"// output array field
               }},
               { $addFields: { customerName: { $first: "$User.fullName" },caterer: { $first: "$caterer.merchantName" } } },
               {$project:{"type":1,"customerName":1,"caterer":1,"subId":1,"subcriptionPeriod":1}},
               { $skip : (page-1)*limit},
               { $limit : limit }
           ]).exec();
        if(data){
             return res.status(200).json({ status: true, Details:{SubDetails:data,personal,business,multiple}});
        }
        else{
             return res.status(500).json({ status: false, message:"Subscription not found"});
        }
     } catch (err) {
        return res.status(500).json({ status: false, message:err.message });
     };
};


// Admin
exports.getSubscriptionDetails = async (req, res) => {
     try{
          let data = await SubscriptionModel.aggregate([
               {$match:{_id:ObjectId(req.body.id)}},
               {$lookup: {
                from: "users", // collection to
                let: { id: "$user"},
                pipeline: [
                    { $match:
                            { $expr:
                                    { $and:
                                            [{ $eq: [ "$_id",  "$$id" ] }]
                                    }
                            }
                    },
                    {$project:{"fullName":1,"email":1,"phone":1}}
                ],
                as: "User"// output array field
               }},
               {$lookup: {
                    from: "caterers", // collection to
                    let: { id: "$caterer"},
                    pipeline: [
                        { $match:
                                { $expr:
                                        { $and:
                                                [{ $eq: [ "$_id",  "$$id" ] }]
                                        }
                                }
                        },
                        {$project:{"merchantName":1,"address":1,"status":1}}
                    ],
                    as: "caterer"// output array field
                   }},
               {$lookup: {
                from: "drivers", // collection to
                let: { id: "$driver"},
                pipeline: [
                    { $match:
                            { $expr:
                                    { $and:
                                            [{ $eq: [ "$_id",  "$$id" ] }]
                                    }
                            }
                    },
                    {$project:{"driverId":1,"firstName":1,"lastName":1,"online":1}}
                ],
                as: "Driver"// output array field
               }},
               {$project:{"__v":0,"updatedAt":0,"createdAt":0,"driver":0,"user":0,"category":0,"paymentMethod":0,"promotionCode":0,"scheduleDay":0,"deliveryAddress":0}}
           ]).exec();
         
          //  console.log("data",data)
        if(data && data.length > 0){
          let mp = [];
          if(data[0].mealPlane.length > 0){
               for await(let mealPlane of data[0].mealPlane){
                    let tp = {};
                    let MC = [];
                    let AD = [];
                    let m = await MealPlaneModel.findOne({_id: mealPlane.mealPlanId},"name").lean().exec();
                    if(mealPlane.mealCourse && mealPlane.mealCourse.length > 0){
                         for await(let c of mealPlane.mealCourse){
                              let temp = {};
                              temp.name = c.name;
                              temp.dish = c.dish.length;
                              MC.push(temp);
                         }
                    }

                    if(mealPlane.addOnes && mealPlane.addOnes.length > 0){
                         for await(let a of mealPlane.addOnes){
                              let temp = {};
                              temp.name = a.name;
                              temp.dish = a.dish.length;
                              AD.push(temp);
                         }
                    }
                    
                    tp.name = m.name;
                    tp.mealCourse = MC;
                    tp.addOnes = AD;
                    mp.push(tp)
               }
          }
          data[0].mealPlane = mp;
          
          if(data[0].Driver.length > 0){
               data[0].Driver = data[0].Driver[0]
          }
          else{
               data[0].Driver = {}
          }
          if(data[0].User.length > 0){
               data[0].User = data[0].User[0]
          }
          else{
               data[0].User = {}
          }
          if(data[0].caterer.length > 0){
               data[0].caterer = data[0].caterer[0]
          }
          else{
               data[0].caterer = {}
          }
             return res.status(200).json({ status: true, data:data});
        }
        else{
             return res.status(500).json({ status: false, message:"Subscription not found"});
        }
     } catch (err) {
        return res.status(500).json({ status: false, message:err.message });
     };
};

// Admin
exports.searchSubscription= async (req, res) => {
     try{         

          if(!req.body.search){
               return res.status(404).json({ status: false, message:"Invalid Input"});
          }

          let totalSubscriptionCount = await SubscriptionModel.countDocuments({}).exec();

          let data = await SubscriptionModel.aggregate([
               {$match:{type:{ $regex:'^' + req.body.search, $options: 'i'}}},
               {$lookup: {
                from: "users", // collection to
                let: { id: "$user"},
                pipeline: [
                    { $match:
                            { $expr:
                                    { $and:
                                            [{ $eq: [ "$_id",  "$$id" ] }]
                                    }
                            }
                    },
                    {$project:{"fullName":1}}
                ],
                as: "User"// output array field
               }},
               
               {$lookup: {
                from: "caterers", // collection to
                let: { id: "$caterer"},
                pipeline: [
                    { $match:
                            { $expr:
                                    { $and:
                                            [{ $eq: [ "$_id",  "$$id" ] }]
                                    }
                            }
                    },
                    {$project:{"merchantName":1}}
                ],
                as: "caterer"// output array field
               }},
               { $addFields: { customerName: { $first: "$User.fullName" },caterer: { $first: "$caterer.merchantName" } } },
               {$project:{"type":1,"customerName":1,"caterer":1,"subId":1,"period":1,"deliveryTime":1,"status":1}},
          ]).exec();

          //    if(data){
          if(data && data.length>0){
               return res.status(200).json({ status: true, message:"success", data:data,totalSubscriptions:totalSubscriptionCount});
          }
          else{
               return res.status(200).json({ status: true, message:"No Result Subscription not found", data:data});
               // return res.status(500).json({ status: false, message:"No Result Subscription not found", data:data});
          }

     } catch (err) {
        return res.status(500).json({ status: false, message:err.message });
     };
};


// Admin
exports.searchSubscriptionHistory= async (req, res) => {
     try{         

          if(!req.body.search){
               return res.status(404).json({ status: false, message:"Invalid Input"});
          }

          let totalSubscriptionCount = await SubscriptionModel.countDocuments({}).exec();

          let data = await SubscriptionModel.aggregate([
               {$match:{type:{ $regex:'^' + req.body.search, $options: 'i'}}},
               {$lookup: {
                from: "users", // collection to
                let: { id: "$user"},
                pipeline: [
                    { $match:
                            { $expr:
                                    { $and:
                                            [{ $eq: [ "$_id",  "$$id" ] }]
                                    }
                            }
                    },
                    {$project:{"fullName":1}}
                ],
                as: "User"// output array field
               }},
               
               {$lookup: {
                from: "caterers", // collection to
                let: { id: "$caterer"},
                pipeline: [
                    { $match:
                            { $expr:
                                    { $and:
                                            [{ $eq: [ "$_id",  "$$id" ] }]
                                    }
                            }
                    },
                    {$project:{"merchantName":1}}
                ],
                as: "caterer"// output array field
               }},
               { $addFields: { customerName: { $first: "$User.fullName" },caterer: { $first: "$caterer.merchantName" } } },
               {$project:{"type":1,"customerName":1,"caterer":1,"subId":1,"period":1,"deliveryTime":1,"status":1}},
          ]).exec();

          //    if(data){
          if(data && data.length>0){
               return res.status(200).json({ status: true, message:"success", data:data,totalSubscriptions:totalSubscriptionCount});
          }
          else{
               return res.status(200).json({ status: true, message:"No Result Subscription not found", data:data});
               // return res.status(500).json({ status: false, message:"No Result Subscription not found", data:data});
          }

     } catch (err) {
        return res.status(500).json({ status: false, message:err.message });
     };
};


// Admin
exports.getSubscriptionsByStatus= async (req, res) => {
     try{       
          console.log("totalSubscriptionCount status ")
          console.log("req.body ",req.body)  

          if(!req.body.status){
               return res.status(404).json({ status: false, message:"Invalid Input"});
          }

          let totalSubscriptionCount = await SubscriptionModel.countDocuments({status:{ $regex:'^' + req.body.status, $options: 'i'}}).exec();
          let data = await SubscriptionModel.aggregate([
               {$match:{status:{ $regex:'^' + req.body.status, $options: 'i'}}},
               {$lookup: {
                from: "users", // collection to
                let: { id: "$user"},
                pipeline: [
                    { $match:
                            { $expr:
                                    { $and:
                                            [{ $eq: [ "$_id",  "$$id" ] }]
                                    }
                            }
                    },
                    {$project:{"fullName":1}}
                ],
                as: "User"// output array field
               }},
               
               {$lookup: {
                from: "caterers", // collection to
                let: { id: "$caterer"},
                pipeline: [
                    { $match:
                            { $expr:
                                    { $and:
                                            [{ $eq: [ "$_id",  "$$id" ] }]
                                    }
                            }
                    },
                    {$project:{"merchantName":1}}
                ],
                as: "caterer"// output array field
               }},
               { $addFields: { customerName: { $first: "$User.fullName" },caterer: { $first: "$caterer.merchantName" } } },
               {$project:{"type":1,"customerName":1,"caterer":1,"subId":1,"period":1,"deliveryTime":1,"status":1}},
          ]).exec();
          
          //    if(data && data.length>0){
          if(data){
             return res.status(200).json({ status: true, message:"success", data:data,totalSubscriptions:totalSubscriptionCount});
        }
        else{
             return res.status(500).json({ status: false, message:"No Result Subscription not found"});
        }

     } catch (err) {
        return res.status(500).json({ status: false, message:err.message });
     };
};


exports.getSomeSubscriptionInfo = async (req, res) => {
     try{
     let subscription = await SubscriptionModel.findOne({_id:req.body.id},"quantity status period to from type deliveryTime price subId mealPlane").lean().exec();
          if(subscription){
               let mpId = [];
               for await (let mp of subscription.mealPlane){
                    mpId.push(mp.mealPlanId);
               }
               let mp = await MealPlaneModel.find({_id:{$in:mpId}},"").lean().exec();

               let mealPlane = [];
               for await(let m of subscription.mealPlane){
                    let filter = mp.filter(x=> x._id.valueOf() == m.mealPlanId.valueOf());
                    if(filter && filter.length > 0){
                         mealPlane.push(filter[0].name);
                    }
               }
               if(mealPlane && mealPlane.length < 1){
                    mealPlane = ""
               }
               else{
                    mealPlane = mealPlane.toString()
               }
               subscription.mealPlane = mealPlane;

               return res.status(200).json({ status: true, data:subscription});

          }
          else{
               return res.status(500).json({ status: false, message:"Subscription not found"});
          }
     } catch (err) {
        return res.status(500).json({ status: false, message:err.message });
     };
};

exports.getSubscriptionMealPlan = async (req, res) => {
     try{
          let subscription = await SubscriptionModel.findOne({_id:req.body.id},"tax deliveryCharges status subId mealPlane").lean().exec();
          if(subscription){
               let mpId = [];
               for await (let mp of subscription.mealPlane){
                    mpId.push(mp.mealPlanId);
               }
               let mp = await MealPlaneModel.find({_id:{$in:mpId}},"").lean().exec();

               let mealPlane = [];

               for await(let m of subscription.mealPlane){
                    let temp = {};
                    temp.mealPlanId = m.mealPlanId;
                    let filter = mp.filter(x=> x._id.valueOf() == m.mealPlanId.valueOf());
                    if(filter && filter.length > 0){
                         temp.name = filter[0].name;
                    }
                    let mealCourse = []
                    if(m.mealCourse){
                         for await(let mc of m.mealCourse){
                              mealCourse.push({
                                   name: mc.name,
                                   dish:mc.dish.length,
                                   quantity: mc.quantity
                              })
                         }
                    }
                    let addOnes = [];
                    if(m.addOnes){
                         for await(let ado of m.addOnes){
                              addOnes.push({
                                   name: ado.name,
                                   dish:ado.dish.length,
                                   quantity: ado.quantity
                              })
                         }
                    }
                    temp.mealCourse = mealCourse;
                    temp.addOnes = addOnes;
                    mealPlane.push(temp);
               }
               subscription.mealPlane = mealPlane;
               return res.status(200).json({ status: true, data:subscription});
          }
          else{
               return res.status(500).json({ status: false, message:"Subscription not found"});
          }
     } catch (err) {
        return res.status(500).json({ status: false, message:err.message });
     };
};

exports.getSubscriptionScheduleMenu = async (req, res) => {
     try{
          let subscription = await SubscriptionModel.findOne({_id:req.body.id},"scheduleDay mealPlane").lean().exec();
          if(subscription){
               let mpId = [];
               for await (let mp of subscription.mealPlane){
                    mpId.push(mp.mealPlanId);
               }
               let mp = await MealPlaneModel.find({_id:{$in:mpId}},"").lean().exec();

               let mealPlane = [];

               for await(let m of subscription.mealPlane){
                    let temp = {};
                    temp.mealPlanId = m.mealPlanId;
                    let filter = mp.filter(x=> x._id.valueOf() == m.mealPlanId.valueOf());
                    if(filter && filter.length > 0){
                         temp.name = filter[0].name;
                    }
                    let mealCourse = []
                    if(m.mealCourse){
                         for await(let mc of m.mealCourse){
                              mealCourse.push({
                                   name: mc.name,
                                   dish:mc.dish.length,
                                   quantity: mc.quantity
                              })
                         }
                    }
                    let addOnes = [];
                    if(m.addOnes){
                         for await(let ado of m.addOnes){
                              addOnes.push({
                                   name: ado.name,
                                   dish:ado.dish.length,
                                   quantity: ado.quantity
                              })
                         }
                    }
                    temp.mealCourse = mealCourse;
                    temp.addOnes = addOnes;
                    mealPlane.push(temp);
               }

               let scheduleMenu = [];
               for await(let m of subscription.scheduleDay){
                    let temp = {};
                    temp.day = m.day;
                    let filter = mp.filter(x=> x._id == m.mealPlane);
                    if(filter){
                         temp.mealPlanName = filter.name;
                    }

                    let mlp = mealPlane.filter(x => x.mealPlanId.valueOf() == m.mealPlane);   
                    temp.mealCourse = (mlp && mlp.length > 0)? mlp[0].mealCourse:"";
                    temp.addOnes = (mlp && mlp.length > 0)? mlp[0].addOnes:"";
                    scheduleMenu.push(temp);
               }

               subscription.scheduleDay = scheduleMenu;
               delete subscription.mealPlane;
               return res.status(200).json({ status: true, data:subscription});
          }
          else{
               return res.status(500).json({ status: false, message:"Subscription not found"});
          }
     } catch (err) {
        return res.status(500).json({ status: false, message:err.message });
     };
};

exports.getSubscriptionDish= async (req, res) => {
     try{
     let subscription = await SubscriptionModel.findOne({_id:req.body.id},"mealPlane").lean().exec();
          if(subscription){
               let dishId = [];
               for await(let m of subscription.mealPlane){
                    if(m.mealCourse){
                         for await(let mc of m.mealCourse){
                              for await(let d of mc.dish){
                                   dishId.push(d.dishId);
                              }
                         }
                    }

                    if(m.addOnes){
                         for await(let ado of m.addOnes){
                              for await(let a of ado.dish){
                                   dishId.push(a.dishId);
                              }
                         }
                    }
               }
               let dishs = await DishModel.find({_id:{$in:dishId}},"name image").lean().exec();
               subscription.dishs = dishs;
               delete subscription.mealPlane;
               return res.status(200).json({ status: true, data:subscription});
          }
          else{
               return res.status(500).json({ status: false, message:"Subscription not found"});
          }
     } catch (err) {
        return res.status(500).json({ status: false, message:err.message });
     };
};


exports.filterSubscription= async (req, res) => {
     try{
          let query = {};
          if(req.body.type && req.body.type.length > 0){
               Object.assign(query, {type:{"$in":req.body.type}});
          }
          if(req.body.menu){
               Object.assign(query, {mealPlane:ObjectId(req.body.menu)});
          }
          if(req.body.driver){
               Object.assign(query, {"driver":ObjectId(req.body.driver)});
          }
          let data = await SubscriptionModel.aggregate([
               {$match:query},
               {$lookup: {
                from: "users", // collection to
                let: { id: "$user"},
                pipeline: [
                    { $match:
                            { $expr:
                                    { $and:
                                            [{ $eq: [ "$_id",  "$$id" ] }]
                                    }
                            }
                    },
                    {$project:{"fullName":1,"email":1,"addresses":1,"status":1}}
                ],
                as: "User"// output array field
               }},
               {$unwind:"$User"},
               { $addFields: { address: {$first:{
                    $filter: {
                        input: "$User.addresses",
                        as: "x",
                        cond: { $and: [
                                // { $gt: [ "$$x.date", startDate] },
                                { $eq: [ "$$x._id", "$deliveryAddress"] },
                            ] }
                    }
                }}} },
               
               {$project:{"cutomerName": "$User.fullName","email":"$User.email","status":"$User.status","address":1}},
           ]).exec();


           if(req.body.city){
               data = data.filter((x)=> x.address && x.address.city && x.address.city.toLowerCase() == req.body.city.toLowerCase());
           }
           return res.status(200).json({ status: true, data});
     } catch (err) {
        return res.status(500).json({ status: false, message:err.message });
     };
};