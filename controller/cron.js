const cron = require('node-cron');
const express = require('express');
const EmailModel = require('../models/email');
app = express();
var moment = require("moment-timezone");
const UserModel = require('../models/user');
const DriverModel = require('../models/driver');
const CatererModel = require('../models/caterer');
const mailer = require("../helper/mailer")

function toTimeZone(time) {
     var format = 'YYYY-MM-DDTHH:mm:ss Z';
     let m = moment(time, format).tz("Asia/Karachi").format(format);
     let t = m.split("T")[1].split("+")[0].trim();
     return t;
}


async function sendperiodEmail(data){
    let currentTime = new Date();
    currentTime = moment(currentTime);
    currentTime = new Date(Date.parse(currentTime));

    let temp = {
         from:data.from,
         to:data.to,
         reply:data.reply,
         date: currentTime,
         time:data.time,
         subject: data.subject,
         description: data.description,
         images: data.images,
         status: "sent"
    }
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
    new EmailModel(temp).save();
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


module.exports = () => { 

     cron.schedule('10 * * * *',
     async function() {
          try{
               let currentDate = new Date();
               let currentDatePlusOnehour = moment(currentDate).add(1, 'hours');

               let currentTime = toTimeZone(currentDate);
               let currentTimePlusOnehour = toTimeZone(currentDatePlusOnehour);
               
               currentDate = moment(currentDate).format('YYYY-MM-DD');

               let currentTimeStart = new Date(Date.parse(currentDate+"T"+ currentTime+".000Z"));
               let currentTimeEnd = new Date(Date.parse(currentDate+"T"+ currentTimePlusOnehour+".000Z"));


               let timeS = parseFloat(moment.utc(currentTimeStart).format('HH') +"."+ moment.utc(currentTimeStart).format('mm'));
               let timeE = parseFloat(moment.utc(currentTimeEnd).format('HH') +"."+ moment.utc(currentTimeEnd).format('mm'));

               let data = await EmailModel.find({period:true,$and: [{periodStartDate: {$lte: currentTimeStart}}, {periodEndDate: {$gte: currentTimeStart}}],TimeInFloat:{$gte: timeS,$lte:timeE}}).lean().exec();
               for await(let d of data){
               let getHours = d.time.split(":")[0]
               let getMinutes = d.time.split(":")[1]

               let hours = moment.utc(currentTimeStart).format('HH');
               let minutes = moment.utc(currentTimeStart).format('mm');

               if(parseInt(hours) == parseInt(getHours)){
                    let t = parseInt(getMinutes) - parseInt(minutes);
                    setTimeout(function() { sendperiodEmail(d)}, t*1000*60);
               }
               }
               
               return res.status(200).json({ status: true, message:"Success"});
          }catch (e) {
               console.log(e);
          }
     }
     );


     cron.schedule('15 * * * *',
     async function() {
          try{
               console.log("Starting schedule")
               let currentDate = new Date();
               let currentDatePlusOnehour = moment(currentDate).add(1, 'hours');

               let currentTime = toTimeZone(currentDate);
               let currentTimePlusOnehour = toTimeZone(currentDatePlusOnehour);
               
               currentDate = moment(currentDate).format('YYYY-MM-DD');

               let currentTimeStart = new Date(Date.parse(currentDate+"T"+ currentTime+".000Z"));
               let currentTimeEnd = new Date(Date.parse(currentDate+"T"+ currentTimePlusOnehour+".000Z"));

               let data = await EmailModel.find({period:false,$and: [{date: {$gte: currentTimeStart}}, {date: {$lte: currentTimeEnd}}]}).lean().exec();
               for await(let d of data){
               let getHours = d.time.split(":")[0]
               let getMinutes = d.time.split(":")[1]

               let hours = moment.utc(currentTimeStart).format('HH');
               let minutes = moment.utc(currentTimeStart).format('mm');

               if(parseInt(hours) == parseInt(getHours)){
                    let t = parseInt(getMinutes) - parseInt(minutes);
                    console.log(t);
                    setTimeout(function() { sendScheduleEmail(d)}, t*1000*60);
               }
               }

               console.log("Finished");
          }catch (e) {
               console.log(e);
          }
     }
     );

}