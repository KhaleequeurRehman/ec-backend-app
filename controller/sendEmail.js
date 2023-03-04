const EmailModel = require('../models/email');
var moment = require("moment-timezone");
const mailer = require("../helper/mailer")
const UserModel = require('../models/user');
const DriverModel = require('../models/driver');
const CatererModel = require('../models/caterer');
//Registration

function toTimeZone(time) {
     var format = 'YYYY-MM-DDTHH:mm:ss Z';
     let m = moment(time, format).tz("Asia/Karachi").format(format);
     let t = m.split("T")[1].split("+")[0].trim();
     return t;
}

async function sendScheduleEmail(data){
     let currentTime = new Date();
     currentTime = moment(currentTime);
     currentTime = new Date(Date.parse(currentTime));

     let to = []
     if(data.to == "All User"){
          let caterer = CatererModel.find({status: true},"email").lean().exec();
          let driver = DriverModel.find({status: true},"email").lean().exec();
          let user = UserModel.find({status: true},"email").lean().exec();
          for await(let c of caterer){
               to.push(c.email)
          }
          for await(let d of driver){
               to.push(d.email)
          }
          for await(let u of user){
               to.push(u.email)
          }
     }
     else if(data.to == "Caterer"){
          let caterer = CatererModel.find({status: true},"email").lean().exec();
          for await(let c of caterer){
               to.push(c.email)
          }
     }
     else if(data.to == "Customer"){
          let user = UserModel.find({status: true},"email").lean().exec();
          for await(let u of user){
               to.push(u.email)
          }
     }
     else if(data.to == "Driver"){
          let driver = DriverModel.find({status: true},"email").lean().exec();
          for await(let d of driver){
               to.push(d.email)
          }
     }
     else{
          to.push(data.to)
     }

     EmailModel.findOneAndUpdate({_id:data._id},{status: "sent"}).exec();

     let from;
     if(data.reply){
          from = "EatCoast Admin <admin@eatcoast.ca>"
     }
     else{
          from = "no-reply <admin@eatcoast.ca>"
     }
     
     if(data.images.length > 0){
          let attachment = []
          for await (let img of data.images){
               let temp = {};
               temp.filename = img;
               temp.path = "./public/email/"+img
               attachment.push(temp);
          }
          mailer.sendEmailWithAttachment(
               from,
               to,
               data.subject,
               data.description,
               attachment
          ) 
          return; 
     }
     if(data.images.length > 0){
          mailer.sendEmail2(
               from,
               to,
               data.subject,
               data.description
          )  
          return;
     }
}

exports.compose = async (req, res) => {
     try{
          let images = [];
          if (req.files || req.files.length > 0 ) {
               for await (img of req.files){
                    images.push(img.filename)
               }
          }
          let temp = {
               from:"admin@eatcoast.ca",
               to:req.body.to,
               reply:req.body.reply,
               time:req.body.time,
               subject: req.body.subject,
               description: req.body.description,
               period: req.body.period,
               status: req.body.status,
               images:images
          } 

          let currentDate = new Date();
          let currentTime = toTimeZone(currentDate);
               
          currentDate = moment(currentDate).format('YYYY-MM-DD');
          let currentDateTime = new Date(Date.parse(currentDate+"T"+ currentTime+".000Z"));
        
          if(req.body.period == true || req.body.period == "true"){
               let startDate = new Date(req.body.periodStartDate);
               startDate = moment(startDate).format('YYYY-MM-DD');
               startDate = new Date(Date.parse(startDate+"T"+ req.body.time+":00.000Z"));

               let endDate = new Date(req.body.periodEndDate);
               endDate = moment(endDate).format('YYYY-MM-DD');
               endDate = new Date(Date.parse(endDate+"T"+ req.body.time+":00.000Z"));
               let PT = req.body.time.split(":");

               if(currentDateTime > endDate){
                    return res.status(500).json({ status: false, message:"Sorry you have selected passed End Date"});
               }

               PT = PT[0]+"."+PT[1];
               Object.assign(temp,{
                    periodStartDate: startDate,
                    TimeInFloat: parseFloat(PT),
                    periodEndDate: endDate
               })
               await new EmailModel(temp).save();
               return res.status(200).json({ status: true, message:"Success"});
          }
          else{
               let date = new Date(req.body.date);
               date = moment(date).format('YYYY-MM-DD');
               date = new Date(Date.parse(date+"T"+ req.body.time+":00.000Z"));

               let PT = req.body.time.split(":");

               PT = PT[0]+"."+PT[1];
               Object.assign(temp,{TimeInFloat: parseFloat(PT),date:date})

               if(currentDateTime > date){
                    return res.status(500).json({ status: false, message:"Sorry you have selected passed date"});
               }
               else if(moment(date).format('YYYY-MM-DD') == moment(currentDateTime).format('YYYY-MM-DD')){
                    let time = date - currentDateTime;
                    if(time < 3600000){
                         let d = new EmailModel(temp).save();
                         // setTimeout(function() { sendScheduleEmail(d)}, time);
                         return res.status(200).json({ status: true, message:"Success"});
                    }
               }
               else{
                    await new EmailModel(temp).save();
                    return res.status(200).json({ status: true, message:"Success"});
               }
               
          }
          
          
     } catch (err) {
          return res.status(500).json({ status: false, message:err.message });
     }
};


exports.sent = async (req, res) => {
     try{
          let data = await EmailModel.find({status:"sent"}).lean().exec();
          if(!data){
               return res.status(404).json({ status: false, message:"No item found" });
          }
          else{
               return res.status(200).json({ status: true, data: data });
          }
     } catch (err) {
          return res.status(500).json({ status: false, message:err.message });
     }
};

exports.inbox = async (req, res) => {
     try{
          let data = await EmailModel.find({status:"inbox"}).lean().exec();
          if(!data){
               return res.status(404).json({ status: false, message:"No item found" });
          }
          else{
               return res.status(200).json({ status: true, data: data });
          }
     } catch (err) {
          return res.status(500).json({ status: false, message:err.message });
     }
};

exports.draft = async (req, res) => {
     try{
          let data = await EmailModel.find({status:"draft"}).lean().exec();
          if(!data){
               return res.status(404).json({ status: false, message:"No item found" });
          }
          else{
               return res.status(200).json({ status: true, data: data });
          }
     } catch (err) {
          return res.status(500).json({ status: false, message:err.message });
     }
};

exports.trash = async (req, res) => {
     try{
          let data = await EmailModel.find({status:"trash"}).lean().exec();
          if(!data){
               return res.status(404).json({ status: false, message:"No item found" });
          }
          else{
               return res.status(200).json({ status: true, data: data });
          }
     } catch (err) {
          return res.status(500).json({ status: false, message:err.message });
     }
};

exports.important = async (req, res) => {
     try{
          let data = await EmailModel.find({status:"important"}).lean().exec();
          if(!data){
               return res.status(404).json({ status: false, message:"No item found" });
          }
          else{
               return res.status(200).json({ status: true, data: data });
          }
     } catch (err) {
          return res.status(500).json({ status: false, message:err.message });
     }
};

exports.starred = async (req, res) => {
     try{
          let data = await EmailModel.find({status:"starred"}).lean().exec();
          if(!data){
               return res.status(404).json({ status: false, message:"No item found" });
          }
          else{
               return res.status(200).json({ status: true, data: data });
          }
     } catch (err) {
          return res.status(500).json({ status: false, message:err.message });
     }
};

exports.update = async (req, res) => {
     try{
          if(!req.body.id){
               return res.status(500).json({ status: false, message:"Id is necessary to update" });
          }
          let check = await EmailModel.findOne({_id:req.body.id}).lean().exec();
          if(!check){
               return res.status(404).json({ status: false, message:"Email not Found With this ID" });
          }
          else{
               await EmailModel.findOneAndUpdate({_id:req.body.id},{status:req.body.status}).exec();
               return res.status(200).json({ status: true, message:"Email Status Updated successfully"});
          }
     } catch (err) {
          return res.status(500).json({ status: false, message:err.message });
     }
};

exports.delete = async (req, res) => {
     try{
          if(!req.body.id){
               return res.status(500).json({ status: false, message:"Id is necessary to delete" });
          }
          let check = await EmailModel.findOne({_id:req.body.id,status:"trash"}).lean().exec();
          if(!check){
               return res.status(404).json({ status: false, message:"Email not Found With this ID" });
          }
          else{
               await EmailModel.findOneAndDelete({_id:req.body.id}).exec();
               return res.status(200).json({ status: true, message:"Email deleted successfully"});
          }
     } catch (err) {
          return res.status(500).json({ status: false, message:err.message });
     }
};

exports.deleteAll = async (req, res) => {
     try{
          let check = await EmailModel.findOne().lean().exec();
          if(!check){
               return res.status(404).json({ status: false, message:"Emails not Found in trash" });
          }
          else{
               await EmailModel.deleteMany({status:"trash"}).exec();
               return res.status(200).json({ status: true, message:"Emails deleted successfully"});
          }
     } catch (err) {
          return res.status(500).json({ status: false, message:err.message });
     }
};
