const UserModel = require('../models/user');
const PaymentMethodModel = require('../models/paymentInfo');
const TransectionModel = require('../models/transection');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.addCard = async (req, res) => {
     try {
          if(!req.body.paymentId){
               return res.status(404).json({ status: false, message:"Payment Id is necessary" });
          }
          let paymentMethodData = {};
          if(req.params.type == "caterer"){
               Object.assign(paymentMethodData,{catererId:req.body.catererId,userType : "caterer"})
          }
          else if(req.params.type == "customer"){
               Object.assign(paymentMethodData,{clientId:req.body.customerId,userType : "customer"})
          }
          else if(req.params.type == "driver"){
               Object.assign(paymentMethodData,{driverId:req.body.driver,userType : "driver"})
          }
          else{
               return res.status(404).json({ status: false, message:"page not found"});
          }

          if(!paymentMethodData[Object.keys(paymentMethodData)[0]]){
               return res.status(404).json({ status: false, message:req.params.type+"Id is necessary" });
          }

          let check = await PaymentMethodModel.findOne(paymentMethodData).lean().exec();
          
          if(check){
               return res.status(500).json({ status: false, message:"Payment Method Already Exists" });
          }

          const { paymentId } = req.body;

          const customer = await stripe.customers.create({
               payment_method: paymentId,
          });
      
          const paymentMethod = await stripe.paymentMethods.retrieve(paymentId);
          const card = paymentMethod.card;

          Object.assign( paymentMethodData = {
               paymentId: paymentMethod.id,
               customerId: customer.id,
               cardBrand: card.brand,
               last4: card.last4,
               expiryMonth: card.exp_month,
               expiryYear: card.exp_year,
          });
          
          await new PaymentMethodModel(paymentMethodData).save();
          
          return res.status(200).json({ status: true, message:"Successfully Card Added" });
     } catch (err) {
          return res.status(500).json({ status: false, message:err.message });
     }
};


exports.updateCard = async (req, res) => {
     try {
          if(!req.body.paymentId){
               return res.status(404).json({ status: false, message:"Payment Id is necessary" });
          }
          let paymentMethodData = {};
          let query = {};
          if(req.params.type == "caterer"){
               Object.assign(query,{catererId:req.body.catererId,userType : "caterer"})
          }
          else if(req.params.type == "customer"){
               Object.assign(query,{clientId:req.body.customerId,userType : "customer"})
          }
          else if(req.params.type == "driver"){
               Object.assign(query,{driverId:req.body.driver,userType : "driver"})
          }
          else{
               return res.status(404).json({ status: false, message:"page not found"});
          }

          if(!query[Object.keys(query)[0]]){
               return res.status(404).json({ status: false, message:req.params.type+"Id is necessary" });
          }

          let check = await PaymentMethodModel.findOne(query).lean().exec();
          
          if(!check){
               return res.status(500).json({ status: false, message:"You have nor added Payment Method" });
          }

          const { paymentId } = req.body;

          const customer = await stripe.customers.create({
               payment_method: paymentId,
          });
      
          const paymentMethod = await stripe.paymentMethods.retrieve(paymentId);
          const card = paymentMethod.card;

          Object.assign( paymentMethodData = {
               paymentId: paymentMethod.id,
               customerId: customer.id,
               cardBrand: card.brand,
               last4: card.last4,
               expiryMonth: card.exp_month,
               expiryYear: card.exp_year,
          });
          
          await PaymentMethodModel.findOneAndUpdate({query},paymentMethodData).exec();
          
          return res.status(200).json({ status: true, message:"Successfully Card Added" });
     } catch (err) {
          return res.status(500).json({ status: false, message:err.message });
     }
};


exports.CutPayment = async (req, res) => {
     try {     
          let data;
          if(!req.body.amount){
               return res.status(404).json({ status: false, message:"Amount is necessary" });
          }
          let temp = {}

          if(req.params.type == "caterer"){
               data = await PaymentMethodModel.findOne({cartererId:req.body.catererId}).lean().exec();
               Object.assign(temp,{catererId:req.body.catererId,userType : "caterer"})
          }
          else if(req.params.type == "customer"){
               data = await PaymentMethodModel.findOne({clientId:req.body.customerId}).lean().exec();
               Object.assign(temp,{clientId:req.body.customerId,userType : "customer"})
          }
          else if(req.params.type == "driver"){
               data = await PaymentMethodModel.findOne({driverId:req.body.driver}).lean().exec();
               Object.assign(temp,{driverId:req.body.driver,userType : "driver"})
          }
          else{
               return res.status(404).json({ status: false, message:"page not found"});
          }
          if(!temp[Object.keys(temp)[0]]){
               return res.status(404).json({ status: false, message:req.params.type+"Id is necessary" });
          }
          if(!data){
               return res.status(500).json({ status: false, message:"You have Not added Payment Method" });
          }


          const paymentIntent = await stripe.paymentIntents.create({
               customer: data.customerId,
               payment_method: data.paymentId,
               amount: parseInt(req.body.amount) * 100,
               currency: "usd",
               confirm: true
          });

          Object.assign(temp,{paymentIntent:paymentIntent,type: "add",amount: parseInt(req.body.amount) * 100})
          
          await new TransectionModel(temp).save();
          
          return res.status(200).json({ status: true, message:"You have Successfully Charged $"+parseInt(req.body.amount) * 100 });
     } catch (err) {
          return res.status(500).json({ status: false, message:err.message });
     }
};


exports.getAllTransection = async (req, res) => {
     try{
       const data = await TransectionModel.find().populate({ path : 'userId', model:UserModel } ).sort({createdAt:-1}).lean().exec();
       return res.status(200).json({ status: true, message:"All Transections Data",data});
     } catch (err) {
       return res.status(500).json({ status: false, message:err.message });
     }
};