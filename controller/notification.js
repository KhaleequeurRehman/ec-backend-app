const NotificatonModel = require('../models/notification');

//Registration
exports.send = async (req, res) => {
     try {
          if (req.body.to !== "Customer" && req.body.to !== "Caterer" && req.body.to !== "Driver") {
               return res.status(500).json({ status: false, message: "to value is not valid" })
          }
          let temp = {
               to: req.body.to,
               title: req.body.title,
               description: req.body.description,
               link: req.body.link
          }
          if (req.file == undefined) {
               new NotificatonModel(temp).save();
               return res.status(200).json({ status: true, message: "Notification Sent successfully" });
          }
          else {
               Object.assign(temp, { image: req.file.filename })
               new NotificatonModel(temp).save();
               return res.status(200).json({ status: true, message: "Notification Sent successfully" });
          }
     } catch (err) {
          return res.status(500).json({ status: false, message: err.message });
     }
};

exports.history = async (req, res) => {
     try {
          // let page = parseInt(req.query.page);
          // let size = parseInt(req.query.size);
          // const sortBy = req.query.sortBy
          // const orderBy = req.query.orderBy
          // const searchBy = req.query.searchBy || ""
          let page = parseInt(req.body.page);
          let size = parseInt(req.body.size);
          const sortBy = req.body.sortBy
          const orderBy = req.body.orderBy
          const searchBy = req.body.searchBy || ""
          
          let totalNotificatonsCount = await NotificatonModel.countDocuments({title: { $regex: '^' + searchBy, $options: 'i' }}).exec();

          let data = await NotificatonModel.find({ title: { $regex: '^' + searchBy, $options: 'i' } })
               .skip((parseInt(page) - 1) * parseInt(size))
               .limit(parseInt(size))
               .sort(`${orderBy === "desc" ? "-" : ""}${sortBy}`)
               .lean()
               .exec();
          res.status(200).json({ status: true, data,totalNotificatonsCount });
     } catch (err) {
          return res.status(500).json({ status: false, message: err.message });
     }
};

exports.getBy = async (req, res) => {
     try {
          // let to = req.params.to
          // let page = parseInt(req.query.page);
          // let size = parseInt(req.query.size);
          // const sortBy = req.query.sortBy
          // const orderBy = req.query.orderBy
          // const searchBy = req.query.searchBy
          let to = req.params.to
          let page = parseInt(req.body.page);
          let size = parseInt(req.body.size);
          const sortBy = req.body.sortBy
          const orderBy = req.body.orderBy
          const searchBy = req.body.searchBy || ""

          let totalNotificatonsCount;
          let data;
          
          if(searchBy){

               totalNotificatonsCount = await NotificatonModel.countDocuments({  $and: [
                    { to: { $regex: '^' + to, $options: 'i' } },
                    { title: { $regex: '^' + searchBy, $options: 'i' } },
               ] }).exec();
               console.log("to ",to)
               console.log("searchBy ",searchBy)
               data = await NotificatonModel.find({ $and: [
                    { to: { $regex: '^' + to, $options: 'i' } },
                    { title: { $regex: '^' + searchBy, $options: 'i' } },
               ] })
               .skip((parseInt(page) - 1) * parseInt(size))
               .limit(parseInt(size))
               .sort(`${orderBy === "desc" ? "-" : ""}${sortBy}`)
               .lean()
               .exec();

          }else{
               totalNotificatonsCount = await NotificatonModel.countDocuments({ to: { $regex: '^' + to, $options: 'i' } }).exec();
          
               data = await NotificatonModel.find({ to: { $regex: '^' + to, $options: 'i' } })
               .skip((parseInt(page) - 1) * parseInt(size))
               .limit(parseInt(size))
               .sort(`${orderBy === "desc" ? "-" : ""}${sortBy}`)
               .lean()
               .exec();
     
          }
          
          // let totalNotificatonsCount = await NotificatonModel.countDocuments({ to: { $regex: '^' + to, $options: 'i' } }).exec();
          // let totalNotificatonsCount = await NotificatonModel.countDocuments({  $or: [
          //      { to: { $regex: '^' + to, $options: 'i' } },
          //      { title: { $regex: '^' + searchBy, $options: 'i' } },
          //    ] }).exec();
          // let totalNotificatonsCount = await NotificatonModel.countDocuments({ to: { $regex: '^' + to, $options: 'i' } }).exec();


          // let data = await NotificatonModel.find({ $or: [
          //      { to: { $regex: '^' + to, $options: 'i' } },
          //      { title: { $regex: '^' + searchBy, $options: 'i' } },
          //    ] })
          // let data = await NotificatonModel.find({ to: { $regex: '^' + to, $options: 'i' } })
          // .skip((parseInt(page) - 1) * parseInt(size))
          // .limit(parseInt(size))
          // .sort(`${orderBy === "desc" ? "-" : ""}${sortBy}`)
          // .lean()
          // .exec();
          res.status(200).json({ status: true, data, totalNotificatonsCount });
     } catch (err) {
          return res.status(500).json({ status: false, message: err.message });
     }
};