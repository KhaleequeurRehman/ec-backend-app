const UserModel = require('../models/user');
const DriverModel = require('../models/driver');
const SubscriptionModel = require('../models/subscription');
const DishModel = require('../models/dish');
const AdminModel = require('../models/admin');
const jwt = require('jsonwebtoken');
const { validateUser,validateCaterer,validatedriver,validateAdmin } = require('../validators/user');
const handlebars = require("handlebars");
const bcrypt = require("bcrypt");
const fs = require("fs");
const pm2 = require("pm2");
const mailer = require("../helper/mailer")
const MealPlaneModel = require('../models/mealPlane');
const CatererModel = require('../models/caterer');
var moment = require("moment-timezone");
async function checkDbConnection(){
        try{
            let data= await SubscriptionModel.findOne({},"_id").exec();
            await new Promise(r => setTimeout(r, 10000));
            if(data || data == null){
                console.log("Success")
                return;
            }
            else{
              console.log("Success")
                pm2.connect(function(err) {
                    if (err) {
                      console.error(err);
                      throw err;
                    }
                  
                    pm2.restart(0, function(err) {
                      pm2.disconnect();   // Disconnects from PM2
                      if (err) throw err
                    });
                  });
            }
        } catch (err) {
            //throw error in json response with status 500.
            console.error(err);
        }
};

var readHTMLFile = function (path, callback) {
  fs.readFile(path, {encoding: "utf-8"}, function (err, html) {
      if (err) {
          // throw err;
          callback(err);
      } else {
          callback(null, html);
      }
  });
};

setInterval(async function () {
    checkDbConnection()
}, 300000)

//Registration
exports.signUp = async (req, res) => {
    try{
    //Checking Data Validation
    const { error } = validateUser(req.body);
    if (error){
     return res.status(400).json({ status: false, message:error.message});
    }
    //Checking If Email Already Exist
    const userExists = await UserModel.findOne({phone: req.body.phone}).exec();
    if (userExists || (userExists && userExists.email == req.body.email)) {
      return res.status(400).json({ status: false, message:"Phone Number Or Email Already Exist" });
    }
    else{
      // Create User object with escaped and trimmed data
      await new UserModel({
        fullName: req.body.fullName,
        phone: req.body.phone,
        email: req.body.email
      }).save();
      return res.status(200).json({ status: true, message:"Successfully Registered" });
    }
  } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
};

//Register New Admin
exports.registerAdmin = async (req, res) => {
    try{
    //Checking Data Validation
    const { error } = validateAdmin(req.body);
    if (error){
     return res.status(400).json({ status: false, message:error.message});
    }

    if (req.user.type !== "admin"){
      return res.status(401).json({ status: false, message:"Only Admin can Register New Admin or Sub Admin"});
    }
    //Checking If Email Already Exist
    const userExists = await AdminModel.findOne({email: req.body.email,type:req.body.type}).exec();
    if (userExists) {
      return res.status(400).json({ status: false, message:"Email Already Exist" });
    }
    else{
      await bcrypt.hash(req.body.password, 10, async function (err, hash) {
        await new AdminModel({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          password: hash,
          phone: req.body.phone,
          type: "subadmin",
        }).save();
      return res.status(200).json({ status: true, message:"Successfully Registered" });
      });
    }
  } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
};

//Delete Admin
exports.deleteAdmin = async (req, res) => {
    try{
    
    if (req.user.type !== "admin"){
      return res.status(401).json({ status: false, message:"Only Admin can Delete Sub Admin"});
    }
    //Checking If Email Already Exist
    const userExists = await AdminModel.findOne({_id:req.body.id}).exec();
    if (!userExists) {
      return res.status(400).json({ status: false, message:"Not Exist" });
    }
    else if (req.user._id == req.body.id) {
      return res.status(400).json({ status: false, message:"You can not delete it self" });
    }
    else{
      await AdminModel.findOneAndDelete({_id:req.body.id}).exec();
      return res.status(200).json({ status: true, message:"Successfully Deleted" });
    }
  } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
};

exports.forgetPasswordAdmin = async (req, res) => {
  try {
    if(!req.body.email){
          return res.status(404).json({ status: false, message:"Email is missing!" });
    }
    else {
      var query = {email: req.body.email.toLowerCase()};
      AdminModel.findOne(query).then(user => {
          if (user) {
              // Generate otp
              let otp = Math.floor(Math.random() * 900000);
              // Html email body
              readHTMLFile("./templates/resetEmail.html", async function (err, html) {
                  if(err){
                    return res.status(500).json({ status: false, message:"Sorry, Some errors during processing please contact admin" });
                  }
                  var template = handlebars.compile(html);
                  const replacements = {
                      otp: otp
                  };
                
                  htmlToSend = template(replacements);
                  // Send confirmation email
                  await mailer.sendEmail(
                    req.body.email,
                    "Password Reset",
                    htmlToSend
                  )
                    user.otp = otp;
                    // Save user.
                    user.save(function (err) {
                        if (err) {
                          return res.status(500).json({ status: false, message:err.message });
                        }
                        else{
                          return res.status(200).json({ status: true, message:"Check your email for verification code." });
                        }
                    });
              });
          } else {
              return res.status(401).json({ status: false, message:"Sorry, We don't know this email address!"});
          }
      });
    }
  } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
}

exports.otpVerificationAdmin = async (req, res) => {
  try {
    if(!req.body.email || !req.body.otp || !req.body.newPassword){
      return res.status(404).json({ status: false, message:"Email or OTP or new Password is missing!" });
    }
    else{
      AdminModel.findOne({email: req.body.email.toLowerCase()}).then(async (user) => {
          if (user) {
            console.log(user.otp)
            if (user.otp == req.body.otp) {
              await bcrypt.hash(req.body.newPassword, 10, async function (err, hash) {
                await AdminModel.findOneAndUpdate({email: req.body.email.toLowerCase()}, {otp:null,password:hash}).exec() ;
                let userData = {
                  _id: user._id,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                  phone: user.phone,
                  type:user.type
                };
            
                //Prepare JWT token for authentication
                const jwtPayload = userData;
                const jwtData = {
                    // expiresIn: "24h"
                    expiresIn: process.env.JWT_TIMEOUT_DURATION,
                };
                userData.token = jwt.sign(jwtPayload, process.env.JWT_SECRET_KEY, jwtData);
                return res.status(200).json({ status: true, message:"Verified and Successfully Login",data:userData});
              });
            } else {
              return res.status(401).json({ status: false, message:"Invalid Verification Code."});
            }
          } else {
            return res.status(401).json({ status: false, message:"Sorry, We don't know this email address!" });
          }
            });
    }  
  } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
}

//Registration
exports.signUpDriver = async (req, res) => {
    try{
    //Checking Data Validation
    const { error } = validatedriver(req.body);
    if (error){
     return res.status(400).json({ status: false, message:error.message});
    }
    //Checking If Email Already Exist
    const driverExists = await DriverModel.findOne({phone: req.body.phone}).exec();
    if (driverExists || (driverExists && driverExists.email == req.body.email.toLowerCase())) {
      return res.status(400).json({ status: false, message:"Phone Number Or Email Already Exist" });
    }
    else{
      await bcrypt.hash(req.body.password, 10, async function (err, hash) {
        let count = await DriverModel.countDocuments().exec();
        await new DriverModel({
          driverId:"ECD - "+parseInt(count+1),
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          phone: req.body.phone,
          email: req.body.email.toLowerCase(),
          password: hash,
          city: req.body.city
        }).save();
        return res.status(200).json({ status: true, message:"Successfully Registered" });
      })
    }
  } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
};

exports.changePassword = async (req, res) => {
    try{
    //hash input password
    await bcrypt.hash(req.body.password, 10, async function (err, hash) {
      if(err){
        return res.status(500).json({ status: false, message:err.message });
      }
      // Create User object with escaped and trimmed data
      await DriverModel.findOneAndUpdate({_id:req.user._id},{
        password: hash
      }).exec();
    })
      return res.status(200).json({ status: true, message:"Successfully Updated" });
    } catch (err) {
      return res.status(500).json({ status: false, message:err.message });
    }
};

//Login
exports.phoneCheck = async (req, res) => {
  try{
    const { phone } = req.body;

    if (!phone) {
      return res.status(404).json({ status: false, message:"Phone Number is missing"});
    }

    const user = await UserModel.findOne({ phone: phone}).lean().exec();

    if (!user) {
      return res.status(401).json({ status: false, message:"Phone Number is not exits"});
    }
    else{
      return res.status(200).json({ status: true, message:"Phone Number Exits"});
    }
      
    } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
};


//Login Admin
exports.loginAdmin = async (req, res) => {
  try{
    const { email,password } = req.body;

    if (!email) {
      return res.status(404).json({ status: false, message:"Email is missing"});
    }

    const user = await AdminModel.findOne({ email: email}).lean().exec();

    if (!user) {
      return res.status(401).json({ status: false, message:"Invalid Email"});
    }
    bcrypt.compare(password, user.password, async function (err, same) {
      if (err) {return res.status(401).json({ status: false, message:err.message});}
      if (same) {
        let userData = {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          type:user.type
        };
    
        //Prepare JWT token for authentication
        const jwtPayload = userData;
        const jwtData = {
            expiresIn: process.env.JWT_TIMEOUT_DURATION,
        };
        userData.token = jwt.sign(jwtPayload, process.env.JWT_SECRET_KEY, jwtData);
        return res.status(200).json({ status: true, message:"Successfully Login",data:userData});
      }
      else{
        return res.status(401).json({ status: false, message:"Password incorrect"});
      }
    });
    } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
};

//Login
exports.loginDriver = async (req, res) => {
  try{
    const { email,password } = req.body;

    if (!email) {
      return res.status(404).json({ status: false, message:"Email is missing"});
    }

    const user = await DriverModel.findOne({ email: email}).lean().exec();

    if (!user) {
      return res.status(401).json({ status: false, message:"Invalid Email"});
    }
    bcrypt.compare(password, user.password, async function (err, same) {
      if (err) {return res.status(401).json({ status: false, message:err.message});}
      if (same) {
        let userData = {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          type:"driver"
        };
    
        //Prepare JWT token for authentication
        const jwtPayload = userData;
        const jwtData = {
            expiresIn: process.env.JWT_TIMEOUT_DURATION,
        };
        userData.token = jwt.sign(jwtPayload, process.env.JWT_SECRET_KEY, jwtData);
        return res.status(200).json({ status: true, message:"Successfully Login",data:userData});
      }
      else{
        return res.status(401).json({ status: false, message:"Password incorrect"});
      }
    });
    } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
};

//Login
exports.passwordLessLogin = async (req, res) => {
  try{
    const { phone } = req.body;

    if (!phone) {
      return res.status(404).json({ status: false, message:"Phone Number is missing"});
    }

    const user = await UserModel.findOne({ phone: phone}).lean().exec();

    if (!user) {
      return res.status(401).json({ status: false, message:"Invalid Phone Number"});
    }
      let userData = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        type:"user"
      };
    
      //Prepare JWT token for authentication
      const jwtPayload = userData;
      const jwtData = {
          expiresIn: process.env.JWT_TIMEOUT_DURATION,
      };
      userData.token = jwt.sign(jwtPayload, process.env.JWT_SECRET_KEY, jwtData);
      return res.status(200).json({ status: true, message:"Successfully Login",data:userData});
    } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
};

exports.update = async (req, res) => {
  try{
    await UserModel.findOneAndUpdate({_id:req.user._id},req.body).exec();
    return res.status(200).json({ status: true, message:"Successfully Updated" });
  } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
};

exports.addAddress = async (req, res) => {
  try{
    await UserModel.findOneAndUpdate({_id:req.user._id},{$push:{addresses:req.body}}).exec();
    return res.status(200).json({ status: true, message:"Successfully Updated" });
  } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
};

exports.updateAddress = async (req, res) => {
  try{
    await UserModel.findOneAndUpdate({"addresses._id":req.body._id},{"addresses.$":req.body}).exec();
    return res.status(200).json({ status: true, message:"Successfully Updated" });
  } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try{
    let checkAddressId = await SubscriptionModel.findOne({user:req.user._id,deliveryAddress:req.body.deliveryAddress}).lean().exec();
    if(checkAddressId){
      return res.status(500).json({ status: false, message:"This Delivery address is used in Subscription so before delete you should update that subscription"});
    }
    else{
      await UserModel.findOneAndUpdate({_id:req.user._id},{$pull:{addresses:{_id:req.body.id}}}).exec();
      return res.status(200).json({ status: true, message:"Successfully Deleted" });
    }
  } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
};

exports.dash = async (req, res) => {
  try{
    if(req.user.type === 'user'){
      let profile = await UserModel.findOne({_id:req.user._id}).lean().exec();
      let favouriteDish = await DishModel.find({favourite:req.user._id},"-searchTime -ratings -favourite").lean().exec();
      let subscription = await SubscriptionModel.findOne({user:req.user._id}).lean().exec();
      return res.status(200).json({ status: true, data:{profile,subscription,favouriteDish} });
    }
    else if(req.user.type === 'driver'){
      let profile = await DriverModel.findOne({_id:req.user._id},"-password").lean().exec();
      return res.status(200).json({ status: true, data:{profile}});
    }
    else if(req.user.type === 'admin' || req.user.type === 'subadmin'){
      let profile = await AdminModel.findOne({_id:req.user._id},"-password").lean().exec();
      return res.status(200).json({ status: true, data:{profile}});
    }
    else{
      return res.status(401).json({ status: false,message:"You have not valid type of user."});
    }
    
  } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
};

// add
exports.AddDiscount = async (req, res) => {
  try{
    let temp = {
      "status":"unused",
      "assignDate":Date.now(),
      "percent":req.body.percent
    }
    await UserModel.findOneAndUpdate({_id:req.body.id},{discounts:temp}).exec();
    return res.status(200).json({ status: true, message:"Successfully Added" });
  } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
};

exports.AddGiftCards = async (req, res) => {
  try{
    let temp = {
      "status":"unused",
      "assignDate":Date.now(),
      "percent":req.body.percent
    }
    await UserModel.findOneAndUpdate({_id:req.body.id},{giftCard:temp}).exec();
    return res.status(200).json({ status: true, message:"Successfully Added" });
  } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
};

exports.AddPromotions = async (req, res) => {
  try{
    let temp = {
      "status":"unused",
      "assignDate":Date.now(),
      "percent":req.body.percent
    }
    await UserModel.findOneAndUpdate({_id:req.body.id},{promotions:temp}).exec();
    return res.status(200).json({ status: true, message:"Successfully Added" });
  } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
};

// Update
exports.UpdateDiscount = async (req, res) => {
  try{
    if(!req.body.discountId){
      return res.status(500).json({ status: true, message:"Discount Doc ID is necessary to update" });
    }
    else{
      let available = await UserModel.findOne({"discounts._id":req.body.discountId}).exec();
      console.log(available)
      if(available){
        await UserModel.findOneAndUpdate({"discounts._id":req.body.discountId},{"discounts.$.percent":req.body.percent}).exec();
        return res.status(200).json({ status: true, message:"Successfully Updated" });
      }
      else{
        return res.status(500).json({ status: true, message:"Discount Doc Not Found With this ID" });
      }
    }
  } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
};

exports.UpdateGiftCards = async (req, res) => {
  try{
    if(!req.body.giftCardId){
      return res.status(500).json({ status: true, message:"Gift Card Doc ID is necessary to update" });
    }
    else{
      let available = await UserModel.findOne({"giftCard._id":req.body.giftCardId}).exec();
      
      if(available){
        await UserModel.findOneAndUpdate({"giftCard._id":req.body.giftCardId},{"giftCard.$.percent":req.body.percent}).exec();
        return res.status(200).json({ status: true, message:"Successfully Updated" });
      }
      else{
        return res.status(500).json({ status: true, message:"Gift Card Doc Not Found With this ID" });
      }
    }
  } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
};

exports.UpdatePromotions = async (req, res) => {
  try{
    if(!req.body.promotionId){
      return res.status(500).json({ status: true, message:"Promotion Doc ID is necessary to update" });
    }
    else{
      let available = await UserModel.findOne({"promotions._id":req.body.promotionId}).exec();
      
      if(available){
        await UserModel.findOneAndUpdate({"promotions._id":req.body.promotionId},{"promotions.$.percent":req.body.percent}).exec();
        return res.status(200).json({ status: true, message:"Successfully Updated" });
      }
      else{
        return res.status(500).json({ status: true, message:"Promotion Doc Not Found With this ID" });
      }
    }
  } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
};

// Delete

exports.deleteDiscount = async (req, res) => {
  try{
      if(!req.body.discountId){
        return res.status(500).json({ status: true, message:"Discount Doc ID is necessary to Delete" });
      }
      else{
        let available = await UserModel.findOne({"discounts._id":req.body.discountId}).exec();
        console.log(available)
        if(available){
          await UserModel.findOneAndUpdate({"discounts._id":req.body.discountId},{$pull:{discounts:{_id:req.body.discountId}}}).exec();
          return res.status(200).json({ status: true, message:"Successfully Deleted" });
        }
        else{
          return res.status(500).json({ status: true, message:"Discount Doc Not Found With this ID" });
        }
      }
  } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
};

exports.deleteGiftCard = async (req, res) => {
  try{
     if(!req.body.giftCardId){
        return res.status(500).json({ status: true, message:"Gift Card Doc ID is necessary to Delete" });
      }
      else{
        let available = await UserModel.findOne({"giftCard._id":req.body.giftCardId}).exec();
        
        if(available){
          await UserModel.findOneAndUpdate({"giftCard._id":req.body.giftCardId},{$pull:{giftCard:{_id:req.body.giftCardId}}}).exec();
          return res.status(200).json({ status: true, message:"Successfully Deleted" });
        }
        else{
          return res.status(500).json({ status: true, message:"Gift Card Doc Not Found With this ID" });
        }
      }
  } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
};

exports.deletePromotion = async (req, res) => {
  try{
      if(!req.body.promotionId){
        return res.status(500).json({ status: true, message:"Promotion Doc ID is necessary to Delete" });
      }
      else{
        let available = await UserModel.findOne({"promotions._id":req.body.promotionId}).exec();
        
        if(available){
          await UserModel.findOneAndUpdate({"promotions._id":req.body.promotionId},{$pull:{promotions:{_id:req.body.promotionId}}}).exec();
          return res.status(200).json({ status: true, message:"Successfully Deleted" });
        }
        else{
          return res.status(500).json({ status: true, message:"Promotion Doc Not Found With this ID" });
        }
      }
  } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
};

// use
exports.usedDiscount = async (req, res) => {
  try{
    if(!req.body.discountId){
      return res.status(500).json({ status: true, message:"Discount ID is necessary to use" });
    }
    let available = await UserModel.findOne({_id:req.user.id,"discounts._id":req.body.discountId}).exec();
    if(available &&  available.discounts.filter(x => x.status=="unused").length > 0){
      await UserModel.findOneAndUpdate({_id:req.user.id,"discounts._id":req.body.discountId},{"discounts.$.useDate":Date.now(),"discounts.$.status":"used"}).exec();
      return res.status(200).json({ status: true, message:"Successfully Used" });
    }
    else if(available &&  available.discounts.filter(x => x.status=="used").length > 0){
      return res.status(500).json({ status: false, message:"You have Already Used This Discount" });
    }
    else{
      return res.status(404).json({ status: false, message:"This Discount Not Found" });
    }
    
  } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
};

exports.usedGiftCard = async (req, res) => {
  try{
    if(!req.body.giftCardId){
      return res.status(500).json({ status: true, message:"Gift Card ID is necessary to use" });
    }
    
    let available = await UserModel.findOne({_id:req.user._id,"giftCard._id":req.body.giftCardId}).exec();
    console.log(available)
    if(available &&  available.giftCard.filter(x => x.status=="unused").length > 0){
      await UserModel.findOneAndUpdate({_id:req.user._id,"giftCard._id":req.body.giftCardId},{"giftCard.$.useDate":Date.now(),"giftCard.$.status":"used"}).exec();
      return res.status(200).json({ status: true, message:"Successfully Used" });
    }
    else if(available &&  available.giftCard.filter(x => x.status=="used").length > 0){
      return res.status(500).json({ status: false, message:"You have Already Used This Gift Card" });
    }
    else{
      return res.status(404).json({ status: false, message:"This Gift Card Not Found" });
    }
    
  } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
};

exports.usedPromotion = async (req, res) => {
  try{
    if(!req.body.promotionId){
      return res.status(500).json({ status: true, message:"Promotion ID is necessary to use" });
    }
    let available = await UserModel.findOne({_id:req.user._id,"promotions._id":req.body.promotionId}).exec();
    if(available &&  available.promotions.filter(x => x.status=="unused").length > 0){
      await UserModel.findOneAndUpdate({_id:req.user._id,"promotions._id":req.body.promotionId},{"promotions.$.useDate":Date.now(),"promotions.$.status":"used"}).exec();
      return res.status(200).json({ status: true, message:"Successfully Used" });
    }
    else if(available && available.promotions.filter(x => x.status=="used").length > 0){
      return res.status(500).json({ status: false, message:"You have Already Used This Promotion" });
    }
    else{
      return res.status(404).json({ status: false, message:"This Promotion Not Found" });
    }
    
  } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
};


exports.allUser = async (req, res) => {
  try{

    let page = parseInt(req.body.page);
    let size = parseInt(req.body.size);
    const sortBy = req.body.sortBy
    const orderBy = req.body.orderBy
    const searchBy = req.body.searchBy || ""

    if(req.user.type !== 'admin'){
      return res.status(500).json({ status: true, message:"Only admin can fetch this" });
    }

    // let totalUsersCount = await UserModel.countDocuments({}).exec();
    let totalUsersCount = await UserModel.countDocuments({ fullName: { $regex: '^' + searchBy, $options: 'i' } }).exec();

    // let available = await UserModel.find({},"fullName status email addresses").skip((parseInt(req.body.page) - 1) * parseInt(req.body.size)).limit(parseInt(req.body.size)).lean().exec()
    // let available = await UserModel.find({}).skip((parseInt(req.body.page) - 1) * parseInt(req.body.size)).limit(parseInt(req.body.size)).lean().exec()
    let available = await UserModel.find({ fullName: { $regex: '^' + searchBy, $options: 'i' } })
    .skip((page - 1) * size).limit(size)
    .sort(`${orderBy === "desc" ? "-" : ""}${sortBy}`)
    .lean()
    .exec();
    return res.status(200).json({ status: true, message:"All Users" ,data: available,totalUsersCount}); 
    
  } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
};


exports.getAllCustomers = async (req, res) => {
  try{

    console.log("req.body ", req.body)
    let page = parseInt(req.body.page);
    let limit = parseInt(req.body.size);
    const sortBy = req.body.sortBy
    const orderBy = req.body.orderBy
    // let page = parseInt(req.query.page);
    // let limit = parseInt(req.query.size);
    // const sortBy = req.query.sortBy
    // const orderBy = req.query.orderBy

    if(req.user.type !== 'admin'){
      return res.status(500).json({ status: true, message:"Only admin can fetch this" });
    }
    let totalCustomersCount = await UserModel.countDocuments({}).exec();
    let data = await UserModel.find({},"fullName status email addresses").skip((page - 1) * limit).limit(limit).sort(`${orderBy === "desc" ? "-" : ""}${sortBy}`).lean().exec();
      return res.status(200).json({ status: true, message:"All Users",data,totalCustomersCount});

  } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
};

exports.getAllCustomersByStatus = async (req, res) => {
  try{

    console.log("req.body ", req.body)
    let page = parseInt(req.body.page);
    let limit = parseInt(req.body.size);
    const sortBy = req.body.sortBy
    const orderBy = req.body.orderBy
    // let page = parseInt(req.query.page);
    // let limit = parseInt(req.query.size);
    // const sortBy = req.query.sortBy
    // const orderBy = req.query.orderBy

    if(req.user.type !== 'admin'){
      return res.status(500).json({ status: true, message:"Only admin can fetch this" });
    }

    if(!req.body.status){
      return res.status(404).json({ status: true, message:"status is required" });
    }
    let totalCustomersCount = await UserModel.countDocuments({status:req.body.status}).exec();
    let data = await UserModel.find({status:req.body.status},"fullName status email addresses").skip((page - 1) * limit).limit(limit).sort(`${orderBy === "desc" ? "-" : ""}${sortBy}`).lean().exec();

    return res.status(200).json({ status: true, message:"All Users",data,totalCustomersCount});

  } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
};

exports.customerDetails = async (req, res) => {
  try{
    if(req.user.type !== 'admin'){
      return res.status(500).json({ status: true, message:"Only admin can fetch this" });
    }

    let data = await UserModel.findOne({_id:req.body.id}).lean().exec();
    let crnt = await SubscriptionModel.find({user:req.body.id,status:"active"},"caterer mealPlane to from price").lean().exec();
    let sub = await SubscriptionModel.find({user:req.body.id,type:"personal"},"caterer mealPlane to from price").lean().exec();
    let sngl = await SubscriptionModel.find({user:req.body.id,period:"single"},"caterer mealPlane to from price").lean().exec();
    let completed = await SubscriptionModel.find({user:req.body.id,status:"completed"},"price").lean().exec();
  
    let transection = (completed && completed.length > 0)?completed.length + " Order": "0 Order"
    let total = 0;
    if(completed && completed.length > 0){
      for await (let comp of completed){
        total = total + comp.price;
      }
    }
    let current = []
    let subscribe = []
    let single = []
    if(crnt && crnt.length > 0){
      for await(let ct of crnt){
        let temp = {...ct}
        if(ct.mealPlane && ct.mealPlane.length > 0){
          let mp = [];
          for await(let meal of ct.mealPlane){
            let m = await MealPlaneModel.findOne({_id:meal.mealPlanId},"name").lean().exec();
            mp.push(m.name)
          }
          temp.mealPlane = mp.toString();
        }
        if(ct.caterer){
          let c = await CatererModel.findOne({_id:ct.caterer}).lean().exec();
          temp.caterer = c.merchantName + ", "+c.address;
        }
        current.push(temp);
      }
    }

    if(sub && sub.length > 0){
      for await(let ct of sub){
        let temp = {...ct}
        if(ct.mealPlane && ct.mealPlane.length > 0){
          let mp = [];
          for await(let meal of ct.mealPlane){
            let m = await MealPlaneModel.findOne({_id:meal.mealPlanId},"name").lean().exec();
            mp.push(m.name)
          }
          temp.mealPlane = mp.toString();
        }
        if(ct.caterer){
          let c = await CatererModel.findOne({_id:ct.caterer}).lean().exec();
          temp.caterer = c.merchantName + ", "+c.address;
        }
        subscribe.push(temp);
      }
    }

    if(sngl && sngl.length > 0){
      for await(let ct of sngl){
        let temp = {...ct}
        if(ct.mealPlane && ct.mealPlane.length > 0){
          let mp = [];
          for await(let meal of ct.mealPlane){
            let m = await MealPlaneModel.findOne({_id:meal.mealPlanId},"name").lean().exec();
            mp.push(m.name)
          }
          temp.mealPlane = mp.toString();
        }
        if(ct.caterer){
          let c = await CatererModel.findOne({_id:ct.caterer}).lean().exec();
          temp.caterer = c.merchantName + ", "+c.address;
        }
        single.push(temp);
      }
    }

    return res.status(200).json({ status: true, message:"User Details" ,details:{user:data,totalspent:total,transection,current,single,subscribe}}); 
    
  } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
};


exports.updateByAdmin = async (req, res) => {
  try{
       if (req.user.type !== 'admin'){
            // return res.status(404).json({ status: false, message:"Only Caterer can update Cuisine"});
            return res.status(404).json({ status: false, message:"Only admin can update Cuisine"});
       }
       if (!req.body.id){
            return res.status(404).json({ status: false, message:"Id is required." });
       }
       else{
          // let check = await UserModel.findOneAndDelete({_id:req.body.id}).exec();
          let check = await UserModel.findOne({_id:req.body.id}).exec();
          if(!check){
                return res.status(404).json({ status: false, message:"Not Found"});
          }
          else{
                await UserModel.findOneAndUpdate({_id:req.body.id},req.body).exec();
                return res.status(200).json({ status: true, message:"Updated Successfully" });
          };
       }
   
 } catch (err) {
   return res.status(500).json({ status: false, message:err.message });
 }
};

exports.deleteByAdmin = async (req, res) => {
  try{
       if (req.user.type !== 'admin'){
            return res.status(404).json({ status: false, message:"Only Admin can perform this operation"});
       }
       if (!req.body.id){
            return res.status(404).json({ status: false, message:"Id is required." });
       }
       let check = await UserModel.findOneAndDelete({_id:req.body.id}).exec();
       if(!check){
            return res.status(404).json({ status: false, message:"Not Found"});
       }
       else{
            await UserModel.findOneAndDelete({_id:req.body.id}).exec();
            return res.status(200).json({ status: true, message:"Deleted Successfully" });
       }
   
 } catch (err) {
   return res.status(500).json({ status: false, message:err.message });
 }
};


exports.customerpersonalDetails = async (req, res) => {
  try{
    if(req.user.type !== 'admin'){
       return res.status(500).json({ status: true, message:"Only admin can fetch this" });
    }

    let data = await UserModel.findOne({_id:req.body.id}).lean().exec();
 
    return res.status(200).json({ status: true, message:"Customer Personal Details" ,data}); 
    
  } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
};


exports.customerFinancialDetails = async (req, res) => {
  try{
    // if(req.user.type !== 'admin'){
    //   return res.status(500).json({ status: true, message:"Only admin can fetch this" });
    // }

    let crnt = await SubscriptionModel.find({user:req.body.id},"caterer mealPlane to from price").skip((parseInt(req.body.page) - 1) * parseInt(req.body.size)).limit(parseInt(req.body.size)).lean().exec();
  
    let current = []

    if(crnt && crnt.length > 0){
      for await(let ct of crnt){
        let temp = {...ct}
        if(ct.mealPlane && ct.mealPlane.length > 0){
          let mp = [];
          for await(let meal of ct.mealPlane){
            let m = await MealPlaneModel.findOne({_id:meal.mealPlanId},"name").lean().exec();
            mp.push(m.name)
          }
          temp.mealPlane = mp.toString();
        }
        if(ct.caterer){
          let c = await CatererModel.findOne({_id:ct.caterer}).lean().exec();
          temp.caterer = c.merchantName + ", "+c.address;
        }
        current.push(temp);
      }
    }

    return res.status(200).json({ status: true, message:"User Financial Details Details" ,current}); 
    
  } catch (err) {
    return res.status(500).json({ status: false, message:err.message });
  }
};

exports.search = async (req, res) => {
  try {
    const data = await UserModel.find({fullName: { $regex:'^' + req.body.search, $options: 'i'}},"fullName email phone city status").lean().exec();
    return res.status(200).json({status:true, message: "success",data});
  } catch (error) {
    res.status(500).json({success : false, message: "something went wrong", error: error.toString() });
  }
}

//Admin Analytics API
exports.analytics = async (req, res) => {
  try{
    let activeCustomers = await UserModel.countDocuments({status:"active"}).lean().exec();
    let menus = await MealPlaneModel.countDocuments({reviewStatus:true}).lean().exec();
    let activeSubscriptions = await SubscriptionModel.countDocuments({status:"active"}).lean().exec();
    let drivers = await DriverModel.countDocuments({status:"approved"}).lean().exec();
    
    let totalRevnue = "20.4";
    let todayRevnue = "2.4";

    let totalFeeGenerated = "10.4";
    let todayFeeGenerated = "1.4";

    let month =["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep", "Oct","Nov","Dec"]

    let dietary = await SubscriptionModel.countDocuments({status:"active",type:"dietary"}).lean().exec();
    let multiple = await SubscriptionModel.countDocuments({status:"active",type:"multiple"}).lean().exec();
    let single = await SubscriptionModel.countDocuments({status:"active",type:"single"}).lean().exec();
    let bussiness = await SubscriptionModel.countDocuments({status:"active",type:"bussiness"}).lean().exec();
    let personal = await SubscriptionModel.countDocuments({status:"active",type:"personal"}).lean().exec();

    let total = dietary + multiple + personal + bussiness +single;

    
    let allSubscriptions = {
      dietary:(total > 0 && dietary > 0) ? (dietary/total)*100:0,
      multiple:(total > 0 && multiple > 0) ? (multiple/total)*100:0,
      personal:(total > 0 && personal > 0) ? (personal/total)*100:0,
      bussiness:(total > 0 && bussiness > 0) ? (bussiness/total)*100:0,
      single:(total > 0 && single > 0) ? (single/total)*100:0
    }

    let sev = new Date(moment().subtract(7, 'days').format("YYYY-MM-DD"))
    let six = new Date(moment().subtract(6, 'days').format("YYYY-MM-DD"))
    let fiv = new Date(moment().subtract(5, 'days').format("YYYY-MM-DD"))
    let fou = new Date(moment().subtract(4, 'days').format("YYYY-MM-DD"))
    let thr = new Date(moment().subtract(3, 'days').format("YYYY-MM-DD"))
    let two = new Date(moment().subtract(2, 'days').format("YYYY-MM-DD"))
    let one = new Date(moment().subtract(1, 'days').format("YYYY-MM-DD"))

    let newSubscriptions = {}
      newSubscriptions[sev.getDate()+" "+month[sev.getMonth()]] = await SubscriptionModel.countDocuments({status:"active",createdAt:{$gt:sev,$lt:six}}).lean().exec();
      newSubscriptions[six.getDate()+" "+month[six.getMonth()]] = await SubscriptionModel.countDocuments({status:"active",createdAt:{$gt:six,$lt:fiv}}).lean().exec();
      newSubscriptions[fiv.getDate()+" "+month[fiv.getMonth()]] = await SubscriptionModel.countDocuments({status:"active",createdAt:{$gt:fiv,$lt:fou}}).lean().exec();
      newSubscriptions[fou.getDate()+" "+month[fou.getMonth()]] = await SubscriptionModel.countDocuments({status:"active",createdAt:{$gt:fou,$lt:thr}}).lean().exec();
      newSubscriptions[thr.getDate()+" "+month[thr.getMonth()]] = await SubscriptionModel.countDocuments({status:"active",createdAt:{$gt:thr,$lt:two}}).lean().exec();
      newSubscriptions[two.getDate()+" "+month[two.getMonth()]] = await SubscriptionModel.countDocuments({status:"active",createdAt:{$gt:two,$lt:one}}).lean().exec();
      newSubscriptions[one.getDate()+" "+month[one.getMonth()]] = await SubscriptionModel.countDocuments({status:"active",createdAt:{$gt:one}}).lean().exec();
    

    let tweM = new Date(moment().subtract(11, 'months').format("YYYY-MM-DD"))
    let eleM = new Date(moment().subtract(10, 'months').format("YYYY-MM-DD"))
    let tenM = new Date(moment().subtract(9, 'months').format("YYYY-MM-DD"))
    let ninM = new Date(moment().subtract(8, 'months').format("YYYY-MM-DD"))
    let eigM = new Date(moment().subtract(7, 'months').format("YYYY-MM-DD"))
    let sevM = new Date(moment().subtract(6, 'months').format("YYYY-MM-DD"))
    let sixM = new Date(moment().subtract(5, 'months').format("YYYY-MM-DD"))
    let fivM = new Date(moment().subtract(4, 'months').format("YYYY-MM-DD"))
    let fouM = new Date(moment().subtract(3, 'months').format("YYYY-MM-DD"))
    let thrM = new Date(moment().subtract(2, 'months').format("YYYY-MM-DD"))
    let twoM = new Date(moment().subtract(1, 'months').format("YYYY-MM-DD"))
    let oneM = new Date(moment().format("YYYY-MM-DD"))
    
    let singleOrder ={
      [month[tweM.getMonth()]+" "+tweM.getYear()] : await SubscriptionModel.countDocuments({status:"active",period:"single",createdAt:{$gt:tweM,$lt:eleM}}).lean().exec(),
      [month[eleM.getMonth()]+" "+eleM.getYear()] : await SubscriptionModel.countDocuments({status:"active",period:"single",createdAt:{$gt:eleM,$lt:tenM}}).lean().exec(),
      [month[tenM.getMonth()]+" "+tenM.getYear()] : await SubscriptionModel.countDocuments({status:"active",period:"single",createdAt:{$gt:tenM,$lt:ninM}}).lean().exec(),
      [month[ninM.getMonth()]+" "+ninM.getYear()] : await SubscriptionModel.countDocuments({status:"active",period:"single",createdAt:{$gt:ninM,$lt:eigM}}).lean().exec(),
      [month[eigM.getMonth()]+" "+eigM.getYear()] : await SubscriptionModel.countDocuments({status:"active",period:"single",createdAt:{$gt:eigM,$lt:sevM}}).lean().exec(),
      [month[sevM.getMonth()]+" "+sevM.getYear()] : await SubscriptionModel.countDocuments({status:"active",period:"single",createdAt:{$gt:sevM,$lt:sixM}}).lean().exec(),
      [month[sixM.getMonth()]+" "+sixM.getYear()] : await SubscriptionModel.countDocuments({status:"active",period:"single",createdAt:{$gt:sixM,$lt:fivM}}).lean().exec(),
      [month[fivM.getMonth()]+" "+fivM.getYear()] : await SubscriptionModel.countDocuments({status:"active",period:"single",createdAt:{$gt:fivM,$lt:fouM}}).lean().exec(),
      [month[fouM.getMonth()]+" "+fouM.getYear()] : await SubscriptionModel.countDocuments({status:"active",period:"single",createdAt:{$gt:fouM,$lt:thrM}}).lean().exec(),
      [month[thrM.getMonth()]+" "+thrM.getYear()] : await SubscriptionModel.countDocuments({status:"active",period:"single",createdAt:{$gt:thrM,$lt:twoM}}).lean().exec(),
      [month[twoM.getMonth()]+" "+twoM.getYear()] : await SubscriptionModel.countDocuments({status:"active",period:"single",createdAt:{$gt:twoM,$lt:oneM}}).lean().exec(),
      [month[oneM.getMonth()]+" "+oneM.getYear()] : await SubscriptionModel.countDocuments({status:"active",period:"single",createdAt:{$gt:oneM}}).lean().exec()
    }

    let overAllGrowth ={}
    console.log(tweM)
    console.log(month[tweM.getMonth()]+" "+tweM.getYear())
      overAllGrowth[month[tweM.getMonth()]+" "+tweM.getYear()] = 10
      overAllGrowth[month[eleM.getMonth()]+" "+eleM.getYear()] = 13
      overAllGrowth[month[tenM.getMonth()]+" "+tenM.getYear()] = 14
      overAllGrowth[month[ninM.getMonth()]+" "+ninM.getYear()] = 15
      overAllGrowth[month[eigM.getMonth()]+" "+eigM.getYear()] = 10
      overAllGrowth[month[sevM.getMonth()]+" "+sevM.getYear()] = 0
      overAllGrowth[month[sixM.getMonth()]+" "+sixM.getYear()] = 5
      overAllGrowth[month[fivM.getMonth()]+" "+fivM.getYear()] = 10
      overAllGrowth[month[fouM.getMonth()]+" "+fouM.getYear()] = 8
      overAllGrowth[month[thrM.getMonth()]+" "+thrM.getYear()] = 10
      overAllGrowth[month[twoM.getMonth()]+" "+twoM.getYear()] = 6
      overAllGrowth[month[oneM.getMonth()]+" "+oneM.getYear()] = 4
    

    return res.status(200).json({ status: true,data:{
      activeCustomers,
      menus,
      activeSubscriptions,
      drivers,
      totalRevnue,
      todayRevnue,
      totalFeeGenerated,
      todayFeeGenerated,
      overAllGrowth,
      allSubscriptions,
      newSubscriptions,
      singleOrder
    }});
    
    
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: false, message:err});
  }
};