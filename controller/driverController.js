const DriverModel = require('../models/driver');
const SubscriptionModel = require('../models/subscription');

exports.getDriver = async (req, res) => {
  try {
    // let page = parseInt(req.query.page);
    // let size = parseInt(req.query.size);
    // const sortBy = req.query.sortBy
    // const orderBy = req.query.orderBy
    let page = parseInt(req.body.page);
    let size = parseInt(req.body.size);
    const sortBy = req.body.sortBy
    const orderBy = req.body.orderBy

    let totalDriversCount = await DriverModel.countDocuments({}).exec();

    let data = await DriverModel.find({}, "online driverId firstName lastName deliveries status").skip((page - 1) * size).limit(size).sort(`${orderBy === "desc" ? "-" : ""}${sortBy}`).lean().exec()
    // let data = await DriverModel.find({ status: "approved" }, "online driverId firstName lastName deliveries status").skip((page - 1) * size).limit(size).sort(`${orderBy === "desc" ? "-" : ""}${sortBy}`).lean().exec()
    if (data) {
      return res.status(200).json({ status: true, message:"All drivers", data, totalDriversCount });
    }
    else {
      return res.status(500).json({ status: false, message: "Drivers not found" });
    }
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  };
};

exports.driverDetails = async (req, res) => {
  try {
    let data = await DriverModel.findOne({ _id: req.body.id }, "-passwords").lean().exec()
    return res.status(200).json({ status: true, details: data });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  };
};

exports.getDriverWRTStatus = async (req, res) => {
  try {
    let data;
    let totalDriversCount;
    if (req.body.status == "all") {
      totalDriversCount = await DriverModel.countDocuments({}).exec();
      data = await DriverModel.find({}, "online driverId firstName lastName deliveries status").skip((parseInt(req.body.page) - 1) * parseInt(req.body.size)).limit(parseInt(req.body.size)).lean().exec()
    }
    else {
      totalDriversCount = await DriverModel.countDocuments({ status: req.body.status }).exec();
      data = await DriverModel.find({ status: req.body.status }, "online driverId firstName lastName deliveries status").skip((parseInt(req.body.page) - 1) * parseInt(req.body.size)).limit(parseInt(req.body.size)).lean().exec()
    }
    if (data) {
      return res.status(200).json({ status: true, data,totalDriversCount });
    }
    else {
      return res.status(500).json({ status: false, message: "Drivers not found" });
    }
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  };
};

exports.updateDriverStatus = async (req, res) => {
  try {
    if (req.user.type !== "admin") {
      return res.status(500).json({ status: false, message: "Only Admin can change status of driver." });
    }
    if (!req.body.id) {
      return res.status(404).json({ status: false, message: "Driver id is Necessary" });
    }
    await DriverModel.findOneAndUpdate({ _id: req.body.id }, { status: req.body.status }).exec()
    return res.status(200).json({ status: true, message: "Updated Successfully" });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.driverDetailsFinance = async (req, res) => {
  try {
    let driver = await DriverModel.findOne({ _id: req.body.id }, "online driverId firstName lastName deliveries status").lean().exec();
    if (driver) {
      let CompletedSubscription = await SubscriptionModel.find({ driver: req.body.id, status: "completed" }, "deliveryCharges").lean().exec();
      let totalBalance = (CompletedSubscription && CompletedSubscription.length > 0) ? CompletedSubscription.reduce((a, b) => parseFloat(a.deliveryCharges) + parseFloat(b.deliveryCharges), 0) : 0;

      let from = new Date(Date.now() - 13 * 7 * 24 * 60 * 60 * 1000);
      let to = new Date(Date.now());

      let widthdraw = [
        {
          remain: 200,
          widthdraw: 100,
          date: "2023-12-03T06:13:57.725+00:00"
        },
        {
          remain: 300,
          widthdraw: 100,
          date: "2023-11-03T06:13:57.725+00:00"
        },
        {
          remain: 400,
          widthdraw: 100,
          date: "2023-10-03T06:13:57.725+00:00"
        },
        {
          remain: 500,
          widthdraw: 100,
          date: "2022-09-03T06:13:57.725+00:00"
        }
      ]

      let paymentAnalysis = await SubscriptionModel.aggregate([
        { "$match": { caterer: req.body.id, status: "completed", "updatedAt": { "$gte": new Date(Date.now() - 13 * 7 * 24 * 60 * 60 * 1000), "$lt": new Date(Date.now()) } } },
        {
          $facet: {
            week1: [
              { "$match": { "updatedAt": { "$gte": new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000), "$lt": new Date(Date.now() - 11 * 7 * 24 * 60 * 60 * 1000) } } },
              {
                $group:
                  { _id: "null", amount: { $sum: "$deliveryCharges" } }
              },
              { $project: { _id: 0, "amount": 1 } },
            ],
            week2: [
              { "$match": { "updatedAt": { "$gte": new Date(Date.now() - 11 * 7 * 24 * 60 * 60 * 1000), "$lt": new Date(Date.now() - 10 * 7 * 24 * 60 * 60 * 1000) } } },
              {
                $group:
                  { _id: "null", amount: { $sum: "$deliveryCharges" } }
              },
              { $project: { _id: 0, "amount": 1 } },
            ],
            week3: [
              { "$match": { "updatedAt": { "$gte": new Date(Date.now() - 10 * 7 * 24 * 60 * 60 * 1000), "$lt": new Date(Date.now() - 9 * 7 * 24 * 60 * 60 * 1000) } } },
              {
                $group:
                  { _id: "null", amount: { $sum: "$deliveryCharges" } }
              },
              { $project: { _id: 0, "amount": 1 } },
            ],
            week4: [
              { "$match": { "updatedAt": { "$gte": new Date(Date.now() - 9 * 7 * 24 * 60 * 60 * 1000), "$lt": new Date(Date.now() - 8 * 7 * 24 * 60 * 60 * 1000) } } },
              {
                $group:
                  { _id: "null", amount: { $sum: "$deliveryCharges" } }
              },
              { $project: { _id: 0, "amount": 1 } },
            ],
            week5: [
              { "$match": { "updatedAt": { "$gte": new Date(Date.now() - 8 * 7 * 24 * 60 * 60 * 1000), "$lt": new Date(Date.now() - 7 * 7 * 24 * 60 * 60 * 1000) } } },
              {
                $group:
                  { _id: "null", amount: { $sum: "$deliveryCharges" } }
              },
              { $project: { _id: 0, "amount": 1 } },
            ],
            week6: [
              { "$match": { "updatedAt": { "$gte": new Date(Date.now() - 7 * 7 * 24 * 60 * 60 * 1000), "$lt": new Date(Date.now() - 6 * 7 * 24 * 60 * 60 * 1000) } } },
              {
                $group:
                  { _id: "null", amount: { $sum: "$deliveryCharges" } }
              },
              { $project: { _id: 0, "amount": 1 } },
            ],
            week7: [
              { "$match": { "updatedAt": { "$gte": new Date(Date.now() - 6 * 7 * 24 * 60 * 60 * 1000), "$lt": new Date(Date.now() - 5 * 7 * 24 * 60 * 60 * 1000) } } },
              {
                $group:
                  { _id: "null", amount: { $sum: "$deliveryCharges" } }
              },
              { $project: { _id: 0, "amount": 1 } },
            ],
            week8: [
              { "$match": { "updatedAt": { "$gte": new Date(Date.now() - 5 * 7 * 24 * 60 * 60 * 1000), "$lt": new Date(Date.now() - 4 * 7 * 24 * 60 * 60 * 1000) } } },
              {
                $group:
                  { _id: "null", amount: { $sum: "$deliveryCharges" } }
              },
              { $project: { _id: 0, "amount": 1 } },
            ],
            week9: [
              { "$match": { "updatedAt": { "$gte": new Date(Date.now() - 4 * 7 * 24 * 60 * 60 * 1000), "$lt": new Date(Date.now() - 3 * 7 * 24 * 60 * 60 * 1000) } } },
              {
                $group:
                  { _id: "null", amount: { $sum: "$deliveryCharges" } }
              },
              { $project: { _id: 0, "amount": 1 } },
            ],
            week10: [
              { "$match": { "updatedAt": { "$gte": new Date(Date.now() - 3 * 7 * 24 * 60 * 60 * 1000), "$lt": new Date(Date.now() - 2 * 7 * 24 * 60 * 60 * 1000) } } },
              {
                $group:
                  { _id: "null", amount: { $sum: "$deliveryCharges" } }
              },
              { $project: { _id: 0, "amount": 1 } },
            ],
            week11: [
              { "$match": { "updatedAt": { "$gte": new Date(Date.now() - 2 * 7 * 24 * 60 * 60 * 1000), "$lt": new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
              {
                $group:
                  { _id: "null", amount: { $sum: "$deliveryCharges" } }
              },
              { $project: { _id: 0, "amount": 1 } },
            ],
            week12: [
              { "$match": { "updatedAt": { "$gte": new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
              {
                $group:
                  { _id: "null", amount: { $sum: "$deliveryCharges" } }
              },
              { $project: { _id: 0, "amount": 1 } },
            ],
          }
        }
      ]).exec();


      let paymentWeeklyReport = {
        week1: (paymentAnalysis[0].week1[0] == undefined) ? 0 : paymentAnalysis[0].week1[0].amount,
        week2: (paymentAnalysis[0].week2[0] == undefined) ? 0 : paymentAnalysis[0].week2[0].amount,
        week3: (paymentAnalysis[0].week3[0] == undefined) ? 0 : paymentAnalysis[0].week3[0].amount,
        week4: (paymentAnalysis[0].week4[0] == undefined) ? 0 : paymentAnalysis[0].week4[0].amount,
        week5: (paymentAnalysis[0].week5[0] == undefined) ? 0 : paymentAnalysis[0].week5[0].amount,
        week6: (paymentAnalysis[0].week6[0] == undefined) ? 0 : paymentAnalysis[0].week6[0].amount,
        week7: (paymentAnalysis[0].week7[0] == undefined) ? 0 : paymentAnalysis[0].week7[0].amount,
        week8: (paymentAnalysis[0].week8[0] == undefined) ? 0 : paymentAnalysis[0].week8[0].amount,
        week9: (paymentAnalysis[0].week9[0] == undefined) ? 0 : paymentAnalysis[0].week9[0].amount,
        week10: (paymentAnalysis[0].week10[0] == undefined) ? 0 : paymentAnalysis[0].week10[0].amount,
        week11: (paymentAnalysis[0].week11[0] == undefined) ? 0 : paymentAnalysis[0].week11[0].amount,
        week12: (paymentAnalysis[0].week12[0] == undefined) ? 0 : paymentAnalysis[0].week12[0].amount
      }
      let AddedBalance;
      if (!driver.addedBalance) {
        AddedBalance = "0.00"
      }
      else {
        AddedBalance = driver.addedBalance
      }
      return res.status(200).json({ status: true, details: { driver, totalBalance, AddedBalance, dataFrom: from, dataTo: to, widthdrawHistory: widthdraw, paymentWeeklyReport } });
    }
    else {
      return res.status(404).json({ status: false, message: "Driver not found" });
    }



  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  };
};

exports.allDriverSubscription = async (req, res) => {
  try {
    let driver = await DriverModel.findOne({ _id: req.body.id }, "driverId").lean().exec();
    let subs = await SubscriptionModel.find({ driver: req.body.id }, "deliveryTime price period createdAt").sort({ createdAt: -1 }).skip((parseInt(req.body.page) - 1) * parseInt(req.body.size)).limit(parseInt(req.body.size)).lean().exec();

    let subscription = [];

    for await (let sub of subs) {
      let temp = {};
      temp.Id = driver.driverId;
      temp.date = sub.createdAt;
      temp.amount = sub.price;
      temp.type = sub.period;
      temp.time = sub.deliveryTime;
      subscription.push(temp);
    }
    return res.status(200).json({ status: true, data: subscription });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.makeAdjustment = async (req, res) => {
  try {
    if (!req.body.amount || !req.body.addAmount || !req.body.reason || !req.body.id) {
      return res.status(500).json({ status: false, message: "Parameters are wrong" });
    }
    let data = await DriverModel.findOne({ _id: req.body.id }, "addedBalance").lean().exec();
    if (!data) {
      return res.status(500).json({ status: false, message: "Caterer not with id" });
    }
    let temp = {
      addAmount: req.body.addAmount,
      amount: req.body.amount,
      reason: req.body.reason
    }
    let am = (data.addedBalance) ? data.addedBalance : "0.00"
    let addAmount = parseFloat(am) + parseFloat(req.body.amount);
    await DriverModel.findOneAndUpdate({ _id: req.body.id }, { $push: { addedBalanceHistory: temp }, addedBalance: addAmount }).lean().exec();
    return res.status(200).json({ status: true, message: "Sucessfully Added" });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.getmakeAdjustmentDetails = async (req, res) => {
  try {
    let data = await DriverModel.findOne({ _id: req.body.id }, "addedBalanceHistory").lean().exec();
    if (!data) {
      return res.status(500).json({ status: false, message: "Caterer not with id" });
    }
    else {
      if (!data.addedBalanceHistory || data.addedBalanceHistory.length < 1) {
        return res.status(200).json({ status: false, message: "No Any History of Make Adjustment" });
      }
      else {
        return res.status(200).json({ status: true, message: "Sucess", data: data.addedBalanceHistory });
      }
    }
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.search = async (req, res) => {
  try {
    const data = await DriverModel.find({
      $or: [
        { firstName: { $regex: '^' + req.body.search, $options: 'i' } },
        { lastName: { $regex: '^' + req.body.search, $options: 'i' } },
        { status: { $regex: '^' + req.body.search, $options: 'i' } }
      ]
    }, "online driverId firstName lastName deliveries status").lean().exec();
    return res.status(200).json({ status: true, message: "success", data });
  } catch (error) {
    res.status(500).json({ success: false, message: "something went wrong", error: error.toString() });
  }
}