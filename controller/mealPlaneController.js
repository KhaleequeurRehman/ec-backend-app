
const MealPlaneModel = require('../models/mealPlane');

exports.add = async (req, res) => {
     try{
          console.log("MealPlane add req.body", req.body)
          console.log(req.user.type)
          if (req.user.type !== 'caterer' && req.user.type !== 'admin'){
               return res.status(404).json({ status: false, message:"Only Caterer/Admin can add Meal Plane"});
          }
          if (!req.body.name || !req.body.cuisine ||  !req.body.description){
               return res.status(404).json({ status: false, message:"Cuisine or Name or Description is missing"});
          }
          if(req.file == undefined){
               res.status("404").json({message:"Image is Required"});
          }
          else{
                if (!req.file) {
                    return apiResponse.ErrorResponse(res, "Image format not supported");
                } else {
                    let check = await MealPlaneModel.find({ name: {'$regex' : '^'+req.body.name+'$', "$options": "i"},owner:req.user._id}).lean().exec();
                    if(check && check.length > 0) {
                         return res.status(404).json({ status: false, message:"Meal Plane Already Exists With Name"});
                    }
                    let mealCourse = req.body.mealCourse.split(",");
                    
                    let addOnes = req.body.addOnes.split(",");
                    
                    let MCourse = [];
                    for await(let mc of mealCourse){
                         let temp = {};
                         temp.name = mc.replace(/^\s+/, '').replace(/\s+$/, '');
                         MCourse.push(temp);
                    }

                    let aOnes = [];
                    for await(let ao of addOnes){
                         let temp = {};
                         temp.name = ao.replace(/^\s+/, '').replace(/\s+$/, '');
                         aOnes.push(temp);
                    }

                    await new MealPlaneModel({
                         name: req.body.name,
                         description: req.body.description,
                         endDate: req.body.endDate,
                         mealCourse: MCourse,
                         addOnes: aOnes,
                         image: req.file.filename,
                         forReview: req.body.forReview,
                         category:req.body.category,
                         cuisine:req.body.cuisine,
                         owner: req.user._id
                    }).save();
                    return res.status(200).json({ status: true, message:"Meal Plane Added successfully"});
                }   
          }
    } catch (err) {
      return res.status(500).json({ status: false, message:err.message });
    }
};

exports.addDishToMealCourse = async (req, res) => {
     try{
          if (req.user.type !== 'caterer' && req.user.type !== 'admin'){
               return res.status(404).json({ status: false, message:"Only Caterer/Admin can add Dish into Meal Plane"});
          }
          if (!req.body.dishId || !req.body.courseId || !req.body.id ||  !req.body.dishScheduleDate){
               return res.status(404).json({ status: false, message:"Meal Plan ID or Dish ID or CourseID or Dish Schedule Date is Missing"});
          }
          
          let check = await MealPlaneModel.findOne({ _id:req.body.id,owner:req.user._id,"mealCourse._id":req.body.courseId}).lean().exec();
          if(!check) {
               return res.status(404).json({ status: false, message:"Meal Course Not Exist"});
          }
          else{
               await MealPlaneModel.findOneAndUpdate({ _id:req.body.id,owner:req.user._id,"mealCourse._id":req.body.courseId},{ "$push":{"mealCourse.$.dish":{dishId:req.body.dishId,scheduleDate:req.body.dishScheduleDate}}}).lean().exec()
               return res.status(200).json({ status: true, message:"Added successfully"});
          }   
          
    } catch (err) {
      return res.status(500).json({ status: false, message:err.message });
    }
};

exports.deleteDishToMealCourse = async (req, res) => {
     try{
          if (req.user.type !== 'caterer' && req.user.type !== 'admin'){
               return res.status(404).json({ status: false, message:"Only Caterer/Admin can add Dish into Meal Plane"});
          }
          if (!req.body.dishId || !req.body.courseId || !req.body.id ||  !req.body.dishScheduleDate){
               return res.status(404).json({ status: false, message:"Meal Plan ID or Dish ID or CourseID or Dish Schedule Date is Missing"});
          }
          
          let check = await MealPlaneModel.findOne({ _id:req.body.id,owner:req.user._id,"mealCourse._id":req.body.courseId}).lean().exec();
          if(!check) {
               return res.status(404).json({ status: false, message:"Meal Course Not Exist"});
          }
          else{
               await MealPlaneModel.findOneAndUpdate({ _id:req.body.id,owner:req.user._id,"mealCourse._id":req.body.courseId},{ "$pull":{"mealCourse.$.dish":{dishId:req.body.dishId,scheduleDate:req.body.dishScheduleDate}}}).lean().exec()
               return res.status(200).json({ status: true, message:"Added successfully"});
          }   
          
    } catch (err) {
      return res.status(500).json({ status: false, message:err.message });
    }
};

exports.update = async (req, res) => {
     try{
          if (req.user.type !== 'caterer' && req.user.type !== 'admin'){
               return res.status(404).json({ status: false, message:"Only Caterer/Admin can add Meal Plane"});
          }
          if (!req.body.id){
               return res.status(404).json({ status: false, message:"Id is required to Update" });
          }
          let aOnes = [];
          let MCourse = [];
          if(req.body.mealCourse || req.body.addOnes){
               let data = await MealPlaneModel.findOne({_id:req.body.id}).lean().exec();
               if(req.body.mealCourse){     
                    let mealCourse = req.body.mealCourse.replace(/(?! )\W/gmi,"").split(",");
                    console.log(mealCourse)
                    for await(let mc of mealCourse){
                         console.log(mc)
                         if(data.mealCourse && data.mealCourse.length > 0 && data.mealCourse.filter(x=>x.name.trim().toLowerCase() == mc.trim().toLowerCase()).length < 1){
                              let temp = {};
                              temp.name = mc.replace(/^\s+/, '').replace(/\s+$/, '');
                              MCourse.push(temp);
                         }
                    }
               }
               if(req.body.addOnes){     
                   let addOnes = req.body.addOnes.replace(/(?! )\W/gmi,"").split(",");
                    for await(let ao of addOnes){
                         if(data.addOnes && data.addOnes.length > 0 && data.addOnes.filter(x=>x.name.trim().toLowerCase() == ao.trim().toLowerCase()).length < 1){
                              let temp = {};
                              temp.name = ao.replace(/^\s+/, '').replace(/\s+$/, '');
                              aOnes.push(temp);
                         }
                    }
               }

          }
          if(req.file == undefined){
               if(req.body.image){
                    delete req.body.image;
               }
               

               await MealPlaneModel.findOneAndUpdate({_id:req.body.id},{
                    name: req.body.name,
                    description: req.body.description,
                    endDate: req.body.endDate,
                    forReview: req.body.forReview,
                    category:req.body.category,
                    cuisine:req.body.cuisine,
                    "$push":{}
               }).exec();
               return res.status(200).json({ status: true, message:"Meal Plane Updated successfully"});
          }
          else{
               if(req.body.image){
                    delete req.body.image;
                    Object.assign(req.body,{image:req.file.filename})
               }
               else{
                    Object.assign(req.body,{image:req.file.filename})
               }
               await MealPlaneModel.findOneAndUpdate({_id:req.body.id},{
                    name: req.body.name,
                    description: req.body.description,
                    endDate: req.body.endDate,
                    image: req.file.filename,
                    forReview: req.body.forReview,
                    category:req.body.category,
                    cuisine:req.body.cuisine,
                    "$push":{addOnes:aOnes,mealCourse:MCourse}
               }).exec();
               return res.status(200).json({ status: true, message:"Meal Plane Updated successfully"});
          }
      
    } catch (err) {
      return res.status(500).json({ status: false, message:err.message });
    }
};

exports.delete = async (req, res) => {
     try{
          if (req.user.type !== 'caterer' && req.user.type !== 'admin'){
               return res.status(404).json({ status: false, message:"Only Caterer/Admin can add Meal Plane"});
          }
          if (!req.body.id){
               return res.status(404).json({ status: false, message:"Id is required." });
          }
          // let check = await MealPlaneModel.findOneAndDelete({_id:req.body.id,owner:req.user._id}).exec();
          let check = await MealPlaneModel.findOne({_id:req.body.id}).exec();
          if(!check){
               return res.status(404).json({ status: false, message:"Not Found"});
          }
          else{
               await MealPlaneModel.findOneAndDelete({_id:req.body.id}).exec();
               console.log("findOneAndDelete ",req.body.id)
               return res.status(200).json({ status: true, message:"Deleted Successfully" });
          }
      
    } catch (err) {
      return res.status(500).json({ status: false, message:err.message });
    }
};

exports.all = async (req, res) => {
     try{
          if (req.user.type !== 'caterer'){
               let data = await MealPlaneModel.find({owner:req.user._id}).lean().exec();
               return res.status(200).json({ status: true, message:"All",data});
          }
          else{
               let data = await MealPlaneModel.find({}).lean().exec();
               return res.status(200).json({ status: true, message:"All",data});
          }
           
    } catch (err) {
      return res.status(500).json({ status: false, message:err.message });
    }
};


exports.getAllMealplans = async (req, res) => {
     try {
          // console.log("req.query ", req.query)
          // let page = parseInt(req.query.page);
          // let limit = parseInt(req.query.size);
          // const sortBy = req.query.sortBy
          // const orderBy = req.query.orderBy
          console.log("req.body ", req.body)
          let page = parseInt(req.body.page);
          let limit = parseInt(req.body.size);
          const sortBy = req.body.sortBy
          const orderBy = req.body.orderBy
          

          if (req.user.type !== 'caterer'){
               let totalMealPlansCount = await MealPlaneModel.countDocuments({}).exec();
               let data = await MealPlaneModel.find({}).skip((page - 1) * limit).limit(limit).sort(`${orderBy === "desc" ? "-" : ""}${sortBy}`).lean().exec();
               return res.status(200).json({ status: true, message:"All Mealplans",data,totalMealPlansCount});
          }else{
               return res.status(404).json({ status: false, message:"Your Are Not Allowed"});
          }

     } catch (err) {
          return res.status(500).json({ status: false, message: err.message });
     }
};

exports.filterMealplansWithStatus = async (req, res) => {
     try {
          console.log("req.body ", req.body)
          let page = parseInt(req.body.page);
          let limit = parseInt(req.body.size);
          
          if(!req.body.status){
               return res.status(404).json({ status: false, message:"status is required"});
          }

          if (req.user.type !== 'caterer'){
               let totalMealPlansCount = await MealPlaneModel.countDocuments({status:req.body.status}).exec();
               let data = await MealPlaneModel.find({status:req.body.status}).skip((page - 1) * limit).limit(limit).lean().exec();
               return res.status(200).json({ status: true, message:"All Mealplans",data,totalMealPlansCount});
          }else{
               return res.status(404).json({ status: false, message:"Your Are Not Allowed"});
          }

     } catch (err) {
          return res.status(500).json({ status: false, message: err.message });
     }
};


exports.updateMealplanStatus = async (req, res) => {
     try {
          console.log("req.body ", req.body)
          if(!req.body.id){
               return res.status(404).json({ status: false, message:"Invalid Input"});
          }

          if(!req.body.status){
               return res.status(404).json({ status: false, message:"status is required"});
          }

          if (req.user.type !== 'caterer'){
               let data = await MealPlaneModel.findOneAndUpdate({_id:req.body.id},{status:req.body.status}).exec();
               console.log("data mealplan status ", data)
               return res.status(200).json({ status: true, message:"Status Updated Successfully" });
          }else{
               return res.status(404).json({ status: false, message:"Your Are Not Allowed"});
          }

     } catch (err) {
          return res.status(500).json({ status: false, message: err.message });
     }
};

exports.disableMealplan = async (req, res) => {
     try {
          console.log("req.body ", req.body)
          if(!req.body.id){
               return res.status(404).json({ status: false, message:"id is required"});
          }

          if (req.user.type !== 'caterer'){
               let data = await MealPlaneModel.findOneAndUpdate({_id:req.body.id},{disable:true}).exec();
               console.log("data mealplan status ", data)
               return res.status(200).json({ status: true, message:"Mealplan disabled Successfully" });
          }else{
               return res.status(404).json({ status: false, message:"Your Are Not Allowed"});
          }

     } catch (err) {
          return res.status(500).json({ status: false, message: err.message });
     }
};

exports.WrtId = async (req, res) => {
     try{
          let data = await MealPlaneModel.findOne({_id:req.body.id}).lean().exec();
          return res.status(200).json({ status: true, message:"All",data}); 
    } catch (err) {
      return res.status(500).json({ status: false, message:err.message });
    }
};

exports.WrtCatererId = async (req, res) => {
     try{
          let data = await MealPlaneModel.find({owner:req.body.id}).skip((parseInt(req.body.page) - 1) * parseInt(req.body.size)).limit(parseInt(req.body.size)).lean().exec();
          return res.status(200).json({ status: true, message:"All",data});
    } catch (err) {
      return res.status(500).json({ status: false, message:err.message });
    }
};

exports.wrtCuisine = async (req, res) => {
     try{
          let data = await MealPlaneModel.findOne({owner:req.user._id,cuisine:req.body.cuisineId}).lean().exec();
          return res.status(200).json({ status: true, message:"Meal Plane with respect to Cuisine",data}); 
    } catch (err) {
      return res.status(500).json({ status: false, message:err.message });
    }
};

exports.allMealCourseOfCaterer = async (req, res) => {
     try{
          let data = [];
          let mp = await MealPlaneModel.find({owner:req.body.catererId}).lean().exec();

          for(let c = 0; c < mp.length;c++){
               if(mp[c] && mp[c].mealCourse && mp[c].mealCourse.length > 0){
                    for(let i = 0; i < mp[c].mealCourse.length;i++){
                         data.push({
                              mealCourse: mp[c].mealCourse[i].name,
                              MealPlane : mp[c].name,
                              quatity: mp[c].mealCourse[c].dish.length
                         })
                    }
               }
          }
          if(data){
               return res.status(200).json({ status: true, data});
          }
          else{
               return res.status(500).json({ status: false, message:"MealCouse not found"});
          } 
    } catch (err) {
      return res.status(500).json({ status: false, message:err.message });
    }
};

exports.allAddOnesOfCaterer = async (req, res) => {
     try{
          let data = [];
          let mp = await MealPlaneModel.find({owner:req.body.catererId}).lean().exec();
          console.log(mp)
          for(let c = 0; c < mp.length;c++){
               if(mp[c] && mp[c].addOnes && mp[c].addOnes.length > 0){
                    for(let i = 0; i < mp[c].addOnes.length;i++){
                         data.push({
                              addOnes: mp[c].addOnes[i].name,
                              MealPlane : mp[c].name,
                              quatity: mp[c].addOnes[i].dish.length
                         })
                    }
               }
          }
          if(data){
               return res.status(200).json({ status: true, data});
          }
          else{
               return res.status(500).json({ status: false, message:"Add Ones not found"});
          } 
    } catch (err) {
      return res.status(500).json({ status: false, message:err.message });
    }
};



exports.search = async (req, res) => {
     try {
          let totalMealPlansCount = await MealPlaneModel.countDocuments({ name: { $regex:'^' + req.body.search, $options: 'i'} }).exec();
       const data = await MealPlaneModel.find({ name: { $regex:'^' + req.body.search, $options: 'i'} }).lean().exec();
       return res.status(200).json({status:true, message: "success",data,totalMealPlansCount});
     } catch (error) {
       res.status(500).json({success : false, message: "something went wrong", error: error.toString() });
     }
   }


   

// const MealPlaneModel = require('../models/mealPlane');

// exports.add = async (req, res) => {
//      try{
//           console.log(req.user.type)
//           if (req.user.type !== 'caterer' && req.user.type !== 'admin'){
//                return res.status(404).json({ status: false, message:"Only Caterer/Admin can add Meal Plane"});
//           }
//           if (!req.body.name || !req.body.cuisine ||  !req.body.description){
//                return res.status(404).json({ status: false, message:"Cuisine or Name or Description is missing"});
//           }
//           if(req.file == undefined){
//                res.status("404").json({message:"Image is Required"});
//           }
//           else{
//                 if (!req.file) {
//                     return apiResponse.ErrorResponse(res, "Image format not supported");
//                 } else {
//                     let check = await MealPlaneModel.find({ name: {'$regex' : '^'+req.body.name+'$', "$options": "i"},owner:req.user._id}).lean().exec();
//                     if(check && check.length > 0) {
//                          return res.status(404).json({ status: false, message:"Meal Plane Already Exists With Name"});
//                     }
//                     let mealCourse = req.body.mealCourse.split(",");
                    
//                     let addOnes = req.body.addOnes.split(",");
                    
//                     let MCourse = [];
//                     for await(let mc of mealCourse){
//                          let temp = {};
//                          temp.name = mc.replace(/^\s+/, '').replace(/\s+$/, '');
//                          MCourse.push(temp);
//                     }

//                     let aOnes = [];
//                     for await(let ao of addOnes){
//                          let temp = {};
//                          temp.name = ao.replace(/^\s+/, '').replace(/\s+$/, '');
//                          aOnes.push(temp);
//                     }

//                     await new MealPlaneModel({
//                          name: req.body.name,
//                          description: req.body.description,
//                          endDate: req.body.endDate,
//                          mealCourse: MCourse,
//                          addOnes: aOnes,
//                          image: req.file.filename,
//                          forReview: req.body.forReview,
//                          category:req.body.category,
//                          cuisine:req.body.cuisine,
//                          owner: req.user._id
//                     }).save();
//                     return res.status(200).json({ status: true, message:"Meal Plane Added successfully"});
//                 }   
//           }
//     } catch (err) {
//       return res.status(500).json({ status: false, message:err.message });
//     }
// };

// exports.addDishToMealCourse = async (req, res) => {
//      try{
//           if (req.user.type !== 'caterer' && req.user.type !== 'admin'){
//                return res.status(404).json({ status: false, message:"Only Caterer/Admin can add Dish into Meal Plane"});
//           }
//           if (!req.body.dishId || !req.body.courseId || !req.body.id ||  !req.body.dishScheduleDate){
//                return res.status(404).json({ status: false, message:"Meal Plan ID or Dish ID or CourseID or Dish Schedule Date is Missing"});
//           }
          
//           let check = await MealPlaneModel.findOne({ _id:req.body.id,owner:req.user._id,"mealCourse._id":req.body.courseId}).lean().exec();
//           if(!check) {
//                return res.status(404).json({ status: false, message:"Meal Course Not Exist"});
//           }
//           else{
//                await MealPlaneModel.findOneAndUpdate({ _id:req.body.id,owner:req.user._id,"mealCourse._id":req.body.courseId},{ "$push":{"mealCourse.$.dish":{dishId:req.body.dishId,scheduleDate:req.body.dishScheduleDate}}}).lean().exec()
//                return res.status(200).json({ status: true, message:"Added successfully"});
//           }   
          
//     } catch (err) {
//       return res.status(500).json({ status: false, message:err.message });
//     }
// };

// exports.deleteDishToMealCourse = async (req, res) => {
//      try{
//           if (req.user.type !== 'caterer' && req.user.type !== 'admin'){
//                return res.status(404).json({ status: false, message:"Only Caterer/Admin can add Dish into Meal Plane"});
//           }
//           if (!req.body.dishId || !req.body.courseId || !req.body.id ||  !req.body.dishScheduleDate){
//                return res.status(404).json({ status: false, message:"Meal Plan ID or Dish ID or CourseID or Dish Schedule Date is Missing"});
//           }
          
//           let check = await MealPlaneModel.findOne({ _id:req.body.id,owner:req.user._id,"mealCourse._id":req.body.courseId}).lean().exec();
//           if(!check) {
//                return res.status(404).json({ status: false, message:"Meal Course Not Exist"});
//           }
//           else{
//                await MealPlaneModel.findOneAndUpdate({ _id:req.body.id,owner:req.user._id,"mealCourse._id":req.body.courseId},{ "$pull":{"mealCourse.$.dish":{dishId:req.body.dishId,scheduleDate:req.body.dishScheduleDate}}}).lean().exec()
//                return res.status(200).json({ status: true, message:"Added successfully"});
//           }   
          
//     } catch (err) {
//       return res.status(500).json({ status: false, message:err.message });
//     }
// };

// exports.update = async (req, res) => {
//      try{
//           if (req.user.type !== 'caterer' && req.user.type !== 'admin'){
//                return res.status(404).json({ status: false, message:"Only Caterer/Admin can add Meal Plane"});
//           }
//           if (!req.body.id){
//                return res.status(404).json({ status: false, message:"Id is required to Update" });
//           }
//           let aOnes = [];
//           let MCourse = [];
//           if(req.body.mealCourse || req.body.addOnes){
//                let data = await MealPlaneModel.findOne({_id:req.body.id}).lean().exec();
//                if(req.body.mealCourse){     
//                     let mealCourse = req.body.mealCourse.replace(/(?! )\W/gmi,"").split(",");
//                     console.log(mealCourse)
//                     for await(let mc of mealCourse){
//                          console.log(mc)
//                          if(data.mealCourse && data.mealCourse.length > 0 && data.mealCourse.filter(x=>x.name.trim().toLowerCase() == mc.trim().toLowerCase()).length < 1){
//                               let temp = {};
//                               temp.name = mc.replace(/^\s+/, '').replace(/\s+$/, '');
//                               MCourse.push(temp);
//                          }
//                     }
//                }
//                if(req.body.addOnes){     
//                    let addOnes = req.body.addOnes.replace(/(?! )\W/gmi,"").split(",");
//                     for await(let ao of addOnes){
//                          if(data.addOnes && data.addOnes.length > 0 && data.addOnes.filter(x=>x.name.trim().toLowerCase() == ao.trim().toLowerCase()).length < 1){
//                               let temp = {};
//                               temp.name = ao.replace(/^\s+/, '').replace(/\s+$/, '');
//                               aOnes.push(temp);
//                          }
//                     }
//                }

//           }
//           if(req.file == undefined){
//                if(req.body.image){
//                     delete req.body.image;
//                }
               

//                await MealPlaneModel.findOneAndUpdate({_id:req.body.id},{
//                     name: req.body.name,
//                     description: req.body.description,
//                     endDate: req.body.endDate,
//                     forReview: req.body.forReview,
//                     category:req.body.category,
//                     cuisine:req.body.cuisine,
//                     "$push":{}
//                }).exec();
//                return res.status(200).json({ status: true, message:"Meal Plane Updated successfully"});
//           }
//           else{
//                if(req.body.image){
//                     delete req.body.image;
//                     Object.assign(req.body,{image:req.file.filename})
//                }
//                else{
//                     Object.assign(req.body,{image:req.file.filename})
//                }
//                await MealPlaneModel.findOneAndUpdate({_id:req.body.id},{
//                     name: req.body.name,
//                     description: req.body.description,
//                     endDate: req.body.endDate,
//                     image: req.file.filename,
//                     forReview: req.body.forReview,
//                     category:req.body.category,
//                     cuisine:req.body.cuisine,
//                     "$push":{addOnes:aOnes,mealCourse:MCourse}
//                }).exec();
//                return res.status(200).json({ status: true, message:"Meal Plane Updated successfully"});
//           }
      
//     } catch (err) {
//       return res.status(500).json({ status: false, message:err.message });
//     }
// };

// exports.delete = async (req, res) => {
//      try{
//           if (req.user.type !== 'caterer' && req.user.type !== 'admin'){
//                return res.status(404).json({ status: false, message:"Only Caterer/Admin can add Meal Plane"});
//           }
//           if (!req.body.id){
//                return res.status(404).json({ status: false, message:"Id is required." });
//           }
//           let check = await MealPlaneModel.findOneAndDelete({_id:req.body.id,owner:req.user._id}).exec();
//           if(!check){
//                return res.status(404).json({ status: false, message:"Not Found"});
//           }
//           else{
//                await MealPlaneModel.findOneAndDelete({_id:req.body.id}).exec();
//                return res.status(200).json({ status: true, message:"Deleted Successfully" });
//           }
      
//     } catch (err) {
//       return res.status(500).json({ status: false, message:err.message });
//     }
// };

// exports.all = async (req, res) => {
//      try{
//           if (req.user.type !== 'caterer'){
//                let data = await MealPlaneModel.find({owner:req.user._id}).lean().exec();
//                return res.status(200).json({ status: true, message:"All",data});
//           }
//           else{
//                let data = await MealPlaneModel.find({}).lean().exec();
//                return res.status(200).json({ status: true, message:"All",data});
//           }
           
//     } catch (err) {
//       return res.status(500).json({ status: false, message:err.message });
//     }
// };

// exports.WrtId = async (req, res) => {
//      try{
//           let data = await MealPlaneModel.findOne({_id:req.body.id}).lean().exec();
//           return res.status(200).json({ status: true, message:"All",data}); 
//     } catch (err) {
//       return res.status(500).json({ status: false, message:err.message });
//     }
// };

// exports.WrtCatererId = async (req, res) => {
//      try{
//           let data = await MealPlaneModel.find({owner:req.body.id}).skip((parseInt(req.body.page) - 1) * parseInt(req.body.size)).limit(parseInt(req.body.size)).lean().exec();
//           return res.status(200).json({ status: true, message:"All",data});
//     } catch (err) {
//       return res.status(500).json({ status: false, message:err.message });
//     }
// };

// exports.wrtCuisine = async (req, res) => {
//      try{
//           let data = await MealPlaneModel.findOne({owner:req.user._id,cuisine:req.body.cuisineId}).lean().exec();
//           return res.status(200).json({ status: true, message:"Meal Plane with respect to Cuisine",data}); 
//     } catch (err) {
//       return res.status(500).json({ status: false, message:err.message });
//     }
// };

// exports.allMealCourseOfCaterer = async (req, res) => {
//      try{
//           let data = [];
//           let mp = await MealPlaneModel.find({owner:req.body.catererId}).lean().exec();

//           for(let c = 0; c < mp.length;c++){
//                if(mp[c] && mp[c].mealCourse && mp[c].mealCourse.length > 0){
//                     for(let i = 0; i < mp[c].mealCourse.length;i++){
//                          data.push({
//                               mealCourse: mp[c].mealCourse[i].name,
//                               MealPlane : mp[c].name,
//                               quatity: mp[c].mealCourse[c].dish.length
//                          })
//                     }
//                }
//           }
//           if(data){
//                return res.status(200).json({ status: true, data});
//           }
//           else{
//                return res.status(500).json({ status: false, message:"MealCouse not found"});
//           } 
//     } catch (err) {
//       return res.status(500).json({ status: false, message:err.message });
//     }
// };

// exports.allAddOnesOfCaterer = async (req, res) => {
//      try{
//           let data = [];
//           let mp = await MealPlaneModel.find({owner:req.body.catererId}).lean().exec();
//           console.log(mp)
//           for(let c = 0; c < mp.length;c++){
//                if(mp[c] && mp[c].addOnes && mp[c].addOnes.length > 0){
//                     for(let i = 0; i < mp[c].addOnes.length;i++){
//                          data.push({
//                               addOnes: mp[c].addOnes[i].name,
//                               MealPlane : mp[c].name,
//                               quatity: mp[c].addOnes[i].dish.length
//                          })
//                     }
//                }
//           }
//           if(data){
//                return res.status(200).json({ status: true, data});
//           }
//           else{
//                return res.status(500).json({ status: false, message:"Add Ones not found"});
//           } 
//     } catch (err) {
//       return res.status(500).json({ status: false, message:err.message });
//     }
// };



// exports.search = async (req, res) => {
//      try {
//        const data = await MealPlaneModel.find({ name: { $regex:'^' + req.body.search, $options: 'i'} }).lean().exec();
//        return res.status(200).json({status:true, message: "success",data});
//      } catch (error) {
//        res.status(500).json({success : false, message: "something went wrong", error: error.toString() });
//      }
//    }