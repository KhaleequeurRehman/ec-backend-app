const { FeedBack, validate } = require("../models/feedBack")


exports.getAllFeedback = async (req, res) => {
   try {
      let subscriptionId = req.params.subscriptionId
      let page = parseInt(req.query.page);
      let size = parseInt(req.query.size);
      const sortBy = req.query.sortBy
      const orderBy = req.query.orderBy

      let data = await FeedBack.find(
         { subscriptionId: subscriptionId }
      )
         .skip((parseInt(page) - 1) * parseInt(size))
         .limit(parseInt(size))
         .sort(`${orderBy === "desc" ? "-" : ""}${sortBy}`)
         .lean()
         .exec();
      res.status(200).json({ status: true, data });
   } catch (err) {
      return res.status(500).json({ status: false, message: err.message });
   }
};

exports.postFeedback = async (req, res) => {
   try {
      // const { error } = validate(req.body);
      // if (error) return res.status(400).send(error.details[0].message);

      const resData = new FeedBack(req.body)

      await resData.save()

      return res.status(200).json({ status: true, message: "Successfully Submitted" });
   } catch (err) {
      return res.status(500).json({ status: false, message: err.message });
   }
}