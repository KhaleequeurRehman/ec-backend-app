const { findOne } = require('../models/contentEditor');
const ContentEditorModel = require('../models/contentEditor');

//Registration
exports.create = async (req, res) => {
     try{
          let count = await ContentEditorModel.countDocuments().exec();
          let temp = {
               contentEditorId:"ECCE - "+ parseInt(count+1),
               type:req.body.type,
               link:req.body.link,
               title: req.body.title,
               question:req.body.to,
               response: req.body.description,
               publish: req.body.publish,
          }
          if(req.file == undefined){
               new ContentEditorModel(temp).save();
               return res.status(200).json({ status: true, message:"Content Editor saved successfully"});
          }
          else{
               Object.assign(temp,{image:req.file.filename})
               new ContentEditorModel(temp).save();
               return res.status(200).json({ status: true, message:"Content saved successfully"});
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
          let check = await ContentEditorModel.findOne({_id:req.body.id}).lean().exec();
          if(!check){
               return res.status(404).json({ status: false, message:"Content Editor not Found With this ID" });
          }
          let temp = {
               type:req.body.type,
               link:req.body.link,
               title: req.body.title,
               question:req.body.to,
               response: req.body.description,
               publish: req.body.publish,
          }
          if(req.file == undefined){
               await ContentEditorModel.findOneAndUpdate({_id:req.body.id},temp).exec();
               return res.status(200).json({ status: true, message:"Content Editor updated successfully"});
          }
          else{
               Object.assign(temp,{image:req.file.filename})
               await ContentEditorModel.findOneAndUpdate({_id:req.body.id},temp).exec();
               return res.status(200).json({ status: true, message:"Content Editor updated successfully"});
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
          let check = await ContentEditorModel.findOne({_id:req.body.id}).lean().exec();
          if(!check){
               return res.status(404).json({ status: false, message:"Content Editor not Found With this ID" });
          }
          else{
               await ContentEditorModel.findOneAndDelete({_id:req.body.id}).exec();
               return res.status(200).json({ status: true, message:"Content Editor deleted successfully"});
          }
     } catch (err) {
          return res.status(500).json({ status: false, message:err.message });
     }
};

exports.search = async (req, res) => {
     try {
       const data = await ContentEditorModel.find({ title: { $regex:'^' + req.body.search, $options: 'i'} }).lean().exec();
       return res.status(200).json({status:true, message: "success",data});
     } catch (error) {
       res.status(500).json({success : false, message: "something went wrong", error: error.toString() });
     }
}

exports.getPublish = async (req, res) => {
     try{
          let totalpublishedContentCount = await ContentEditorModel.countDocuments({publish:true}).exec();
          let publish = await ContentEditorModel.find({publish:true}).skip((parseInt(req.body.page) - 1) * parseInt(req.body.size)).limit(parseInt(req.body.size)).lean().exec();
          res.status(200).json({ status: true, data:publish,totalpublishedContentCount});
     } catch (err) {
          return res.status(500).json({ status: false, message:err.message });
     }
};

exports.getDraft = async (req, res) => {
     try{
          let totalDraftContentCount = await ContentEditorModel.countDocuments({publish:false}).exec();
          let publish = await ContentEditorModel.find({publish:false}).skip((parseInt(req.body.page) - 1) * parseInt(req.body.size)).limit(parseInt(req.body.size)).lean().exec();
          res.status(200).json({ status: true, data:publish,totalDraftContentCount});
     } catch (err) {
          return res.status(500).json({ status: false, message:err.message });
     }
};
