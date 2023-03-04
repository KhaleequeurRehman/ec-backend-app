const DishModel = require('../models/dish');

exports.addDish = async (req, res) => {
     try{
          if (req.user.type !== 'caterer'){
               return res.status(404).json({ status: false, message:"Only Caterer can add dish"});
          }
          if(req.file == undefined){
               res.status("404").json({message:"Image is Required"});
          }
          else{
                if (!req.file) {
                    return apiResponse.ErrorResponse(res, "Image format not supported");
                } else {
                    let check = await DishModel.find({ name: {'$regex' : '^'+req.body.name+'$', "$options": "i"},owner:req.user._id}).lean().exec();
                    if(check && check.length > 0) {
                         return res.status(404).json({ status: false, message:"Dish Name Already Exists"});
                    }
                    let ingridients;
                    if(req.body.ingridients){
                         ingridients = req.body.ingridients.toString();
                         ingridients = JSON.parse(ingridients);
                    }
                    
                    let nutritionInformation;
                    if(req.body.nutritionInformation){
                         nutritionInformation = req.body.nutritionInformation.toString();
                         nutritionInformation = JSON.parse(nutritionInformation);
                    }
                    await new DishModel({
                         name: req.body.name,
                         description: req.body.description,
                         image: req.file.filename,
                         ingridients: ingridients,
                         mealCourse: req.body.mealCourse,
                         addOnes: req.body.addOnes,
                         forReview: req.body.forReview,
                         owner: req.user._id,
                         NutritionInformation: nutritionInformation,
                         scheduleDish:req.body.scheduleDish
                    }).save();
                    return res.status(200).json({ status: true, message:"New Dish Added successfully"});
                }   
          }
    } catch (err) {
      return res.status(500).json({ status: false, message:err.message });
    }
};

exports.updateDish = async (req, res) => {
     try{
          if (req.user.type !== 'caterer'){
               return res.status(404).json({ status: false, message:"Only Caterer can update dish"});
          }
          if (!req.body.id){
               return res.status(404).json({ status: false, message:"Id is required to Update a dish." });
          }

          if(req.body.ingridients){
               req.body.ingridients = req.body.ingridients.toString();
               req.body.ingridients = JSON.parse(req.body.ingridients);
          }
                   
          if(req.body.nutritionInformation){
               req.body.nutritionInformation = req.body.nutritionInformation.toString();
               req.body.nutritionInformation = JSON.parse(req.body.nutritionInformation);
          }

          if(req.file == undefined){
               if(req.body.image){
                    delete req.body.image;
               }
               await DishModel.findOneAndUpdate({_id:req.body.id},req.body).exec();
               return res.status(200).json({ status: true, message:"Dish Updated successfully"});
          }
          else{
               if(req.body.image){
                    delete req.body.image;
                    Object.assign(req.body, {image:req.file.filename})
               }
               else{
                    Object.assign(req.body, {image:req.file.filename})
               }
               await DishModel.findOneAndUpdate({_id:req.body.id},req.body).exec();
               return res.status(200).json({ status: true, message:"Dish Updated successfully"});
          }
      
    } catch (err) {
      return res.status(500).json({ status: false, message:err.message });
    }
};

exports.deleteDish = async (req, res) => {
     try{
          if (!req.body.id){
               return res.status(404).json({ status: false, message:"Id is required to delete a dish." });
          }
          if (req.user.type !== 'caterer'){
               return res.status(404).json({ status: false, message:"Only Caterer can delete this"});
          }
          let check = await DishModel.findOneAndDelete({_id:req.body.id,owner:req.user._id}).exec();
          if(!check){
               return res.status(404).json({ status: false, message:"Not Found"});
          }
          else{
               await DishModel.findOneAndDelete({_id:req.body.id}).exec();
               return res.status(200).json({ status: true, message:"Dish Deleted Successfully" });
          }
      
    } catch (err) {
      return res.status(500).json({ status: false, message:err.message });
    }
};

exports.allDishWRTMealCourse = async (req, res) => {
     try{
          let data = await DishModel.find({mealCourse:{'$regex' : req.body.mealCourse, "$options": "i"}}).exec();
          return res.status(200).json({ status: true, message:"Dish with respect to MealCourse",data}); 
    } catch (err) {
      return res.status(500).json({ status: false, message:err.message });
    }
};

exports.allDishOfCaterer = async (req, res) => {
     try{
          let data = await DishModel.find({owner:req.body.catererId},"image mealCourse addOnes name").exec();
          if(data){
               return res.status(200).json({ status: true, data});
          }
          else{
               return res.status(500).json({ status: false, message:"Dish of caterer not found"});
          }
    } catch (err) {
      return res.status(500).json({ status: false, message:err.message });
    }
};


exports.allDishWRTaddOnes = async (req, res) => {
     try{
          let data = await DishModel.find({addOnes:{'$regex' : req.body.addOnes, "$options": "i"}}).exec();
          return res.status(200).json({ status: true, message:"Dish with respect to addOnes",data}); 
    } catch (err) {
      return res.status(500).json({ status: false, message:err.message });
    }
};

exports.dishWRTid = async (req, res) => {
     try{
          let data = await DishModel.findOne({_id:req.params.id}).exec();
          return res.status(200).json({ status: true, message:"Dish with respect to ID",data}); 
    } catch (err) {
      return res.status(500).json({ status: false, message:err.message });
    }
};

exports.searchWRTdish = async (req, res) => {
     try{
          let data = await DishModel.find({name:{'$regex' : req.body.dish, "$options": "i"}}).sort({searchTime: -1}).exec();
          await DishModel.updateMany({name:{'$regex' : req.body.dish, "$options": "i"}},{ $inc: { searchTime: 1}}).exec();
          return res.status(200).json({ status: true, message:"Dish with respect to ID",data}); 
    } catch (err) {
      return res.status(500).json({ status: false, message:err.message });
    }
};

exports.favourite = async function (req, res) {
	try {
		if (!req.body.id) {
               return res.status(404).json({ status: false, message:"Dish ID is Necessary."});
		}
		
          const checkID = await DishModel.findOne({_id:req.body.id,favourite:req.user._id},"favourite").lean().exec();
          
		if(checkID){
			console.log("dislike");
			await DishModel.findOneAndUpdate({_id : req.body.id,favourite: req.user._id},{$pull: {favourite: req.user._id}}).exec();
               return res.status(200).json({ status: true, message:"UnFavourite Successfully"});
		}
		else{
			console.log("like");
			await DishModel.findOneAndUpdate({_id : req.body.id},{$push: {favourite: req.user._id}}).exec();
               return res.status(200).json({ status: true, message:"Favourite Successfully"});
		}
	} catch (err) {
		console.log(err);
		return res.status(500).json({ status: false, message:err.message });
	}
}

exports.ratings = async function (req, res) {
	try {
		if (!req.body.id || !req.body.stars || !req.body.comment) {
               return res.status(404).json({ status: false, message:"Dish ID or Stars or Comment is missing."});
		}
		
          const checkID = await DishModel.findOne({_id:req.body.id,"ratings.user":req.user._id}).lean().exec();
		if(checkID){
               return res.status(500).json({ status: false, message:"You have already rating this Dish" });
          }
		else{
			await DishModel.findOneAndUpdate({_id : req.body.id},
                    {$push: {
                         ratings: {
                              stars : req.body.stars,
                              name : req.user.fullName,
                              user : req.user._id,
                              comment : req.body.comment
                         }
                    }
               }).exec();
               return res.status(200).json({ status: true, message:"Rating Successfully Added"});
		}
	} catch (err) {
		console.log(err);
		return res.status(500).json({ status: false, message:err.message });
	}
}
