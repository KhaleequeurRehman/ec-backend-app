const CatererModel = require('../models/caterer');
const SubscriptionModel = require('../models/subscription');
const MealPlanModel = require('../models/mealPlane');
const jwt = require('jsonwebtoken');
const { validateCaterer } = require('../validators/user');
const mailer = require("../helper/mailer")
const handlebars = require("handlebars");
const bcrypt = require("bcrypt");
const fs = require("fs");
var moment = require("moment-timezone");
const subscription = require('../models/subscription');
const DishModel = require('../models/dish');

var readHTMLFile = function (path, callback) {
  fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
    if (err) {
      // throw err;
      callback(err);
    } else {
      callback(null, html);
    }
  });
};

//Registration
exports.signUpCaterer = async (req, res) => {
  try {
    //Checking Data Validation
    const { error } = validateCaterer(req.body);
    if (error) {
      return res.status(400).json({ status: false, message: error.message });
    }
    //Checking If Email Already Exist
    const catererExists = await CatererModel.findOne({ email: req.body.email.toLowerCase() }).exec();
    if (catererExists) {
      return res.status(400).json({ status: false, message: "Email Already Exist" });
    }
    else {
      if (req.files.certificate && req.files.certificate.length > 0) {
        Object.assign(req.body, { certification: req.files.certificate[0].filename })
      }
      if (req.files.licence && req.files.licence.length > 0) {
        Object.assign(req.body, { bussinessLicence: req.files.licence[0].filename })
      }
      // Create User object with escaped and trimmed data
      await bcrypt.hash(req.body.password, 10, async function (err, hash) {
        let count = await CatererModel.countDocuments().exec();
        let otp = Math.floor(Math.random() * 900000);
        await new CatererModel({
          catererId: "ECC - " + parseInt(count + 1),
          merchantName: req.body.merchantName,
          address: req.body.address,
          idCard: req.body.idCard,
          ownerName: req.body.ownerName,
          email: req.body.email.toLowerCase(),
          phone: req.body.phone,
          bussinessLicence: req.body.bussinessLicence,
          certification: req.body.certification,
          password: hash,
          type: "caterer",
          otp,
          status: "email is not verified",
        }).save();

        // Html email body
        readHTMLFile("./templates/registration.html", async function (err, html) {
          if (err) {
            return res.status(500).json({ status: false, message: "Sorry, Some errors during processing please contact admin" });
          }
          var template = handlebars.compile(html);
          const replacements = {
            otp: otp
          };

          htmlToSend = template(replacements);
          // Send confirmation email
          await mailer.sendEmail(
            req.body.email,
            "Email Verification",
            htmlToSend
          )
          return res.status(200).json({ status: true, message: "Check your email for verification code." });
        });
      })
    }
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};


exports.getCatererDocumentByID = async (req, res) => {
  try {

    const catererID = req.params.catererID
    //Checking If Email Already Exist
    const catererExists = await CatererModel.findOne({ _id: catererID }).exec();
    if (!catererExists) {
      return res.status(400).json({ status: false, message: "Caterer doesn't exist" });
    }
    else {
      const response = await CatererModel.find({ _id: catererID });
      console.log("response",response)
      return res.status(200).json({ status: true, message: "Successfully found documents", data: { bussinessLicence: response[0].bussinessLicence, certification: response[0].certification } });
    }
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

//Registration
exports.updateCatererDocument = async (req, res) => {
  try {

    const catererID = req.params.catererID
    //Checking If Email Already Exist
    const catererExists = await CatererModel.findOne({ _id: catererID }).exec();
    if (!catererExists) {
      return res.status(400).json({ status: false, message: "Caterer doesn't exist" });
    }
    else {
      if (req.files.certificate && req.files.certificate.length > 0) {
        Object.assign(req.body, { certification: req.files.certificate[0].filename })
      }
      if (req.files.licence && req.files.licence.length > 0) {
        Object.assign(req.body, { bussinessLicence: req.files.licence[0].filename })
      }
      await CatererModel.findOneAndUpdate({ _id: catererID }, req.body);
      return res.status(200).json({ status: true, message: "Successfully Updated" });
    }
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.EmailVerificationCaterer = async (req, res) => {
  try {
    if (!req.body.email || !req.body.otp) {
      return res.status(404).json({ status: false, message: "Email or OTP or new Password is missing!" });
    }
    else {
      CatererModel.findOne({ email: req.body.email.toLowerCase() }).then(async (user) => {
        if (user) {
          if (user.otp == req.body.otp) {
            await CatererModel.findOneAndUpdate({ email: req.body.email.toLowerCase() }, { status: "request" }).exec()
            return res.status(200).json({ status: true, message: "Verified Successfully" });
          } else {
            return res.status(401).json({ status: false, message: "Invalid Verification Code." });
          }
        } else {
          return res.status(401).json({ status: false, message: "Sorry, We don't know this email address!" });
        }
      });
    }
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
}

exports.forgetPasswordCarter = async (req, res) => {
  try {
    if (!req.body.email) {
      return res.status(404).json({ status: false, message: "Email is missing!" });
    }
    else {
      var query = { email: req.body.email.toLowerCase() };
      CatererModel.findOne(query).then(user => {
        if (user) {
          // Generate otp
          let otp = Math.floor(Math.random() * 900000);
          // Html email body
          readHTMLFile("./templates/resetEmail.html", async function (err, html) {
            if (err) {
              return res.status(500).json({ status: false, message: "Sorry, Some errors during processing please contact admin" });
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
                return res.status(500).json({ status: false, message: err.message });
              }
              else {
                return res.status(200).json({ status: true, message: "Check your email for verification code." });
              }
            });
          });
        } else {
          return res.status(401).json({ status: false, message: "Sorry, We don't know this email address!" });
        }
      });
    }
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
}

exports.changePassword = async (req, res) => {
  try {
    //hash input password
    await bcrypt.hash(req.body.password, 10, async function (err, hash) {
      if (err) {
        return res.status(500).json({ status: false, message: err.message });
      }
      // Create User object with escaped and trimmed data
      await CatererModel.findOneAndUpdate({ _id: req.user._id }, {
        password: hash
      }).exec();
    })
    return res.status(200).json({ status: true, message: "Successfully Updated" });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.otpVerificationCatererForgotPassword = async (req, res) => {
  try {
    if (!req.body.email || !req.body.otp || !req.body.newPassword) {
      return res.status(404).json({ status: false, message: "Email or OTP or new Password is missing!" });
    }
    else {
      CatererModel.findOne({ email: req.body.email.toLowerCase() }).then(async (user) => {
        if (user) {
          if (user.otp == req.body.otp) {
            await bcrypt.hash(req.body.newPassword, 10, async function (err, hash) {
              await CatererModel.findOneAndUpdate({ email: req.body.email.toLowerCase() }, { otp: null, password: hash }).exec();
              let userData = {
                _id: user._id,
                idCard: user.idCard,
                phone: user.phone,
                email: user.email,
                merchantName: user.merchantName,
                ownerName: user.ownerName
              };

              //Prepare JWT token for authentication
              const jwtPayload = userData;
              const jwtData = {
                expiresIn: process.env.JWT_TIMEOUT_DURATION,
              };
              userData.token = jwt.sign(jwtPayload, process.env.JWT_SECRET_KEY, jwtData);
              return res.status(200).json({ status: true, message: "Verified and Successfully Login", data: userData });
            });
          } else {
            return res.status(401).json({ status: false, message: "Invalid Verification Code." });
          }
        } else {
          return res.status(401).json({ status: false, message: "Sorry, We don't know this email address!" });
        }
      });
    }
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
}

//Login Carterer
exports.loginCarter = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(404).json({ status: false, message: "Email or Password is missing" });
    }

    const user = await CatererModel.findOne({ email: email.toLowerCase(), type: "caterer" }).lean().exec();

    if (!user) {
      return res.status(401).json({ status: false, message: "Sorry, We don't know this email address!" });
    }

    if (user.status == "email is not verified") {
      return res.status(401).json({ status: false, message: "Sorry, You Email is not verified" });
    }

    if (user.status == "teminated") {
      return res.status(401).json({ status: false, message: "Sorry, Please contact administrator because administrator has terminated your account" });
    }

    if (user.status == "rejected") {
      return res.status(401).json({ status: false, message: "Sorry, Please contact administrator because administrator has rejected your request" });
    }

    if (user.status !== "approved") {
      return res.status(401).json({ status: false, message: "Sorry, Please contact administrator because administrator has not approved your account" });
    }

    bcrypt.compare(password, user.password, async function (err, same) {
      if (err) { return res.status(401).json({ status: false, message: err.message }); }
      if (same) {
        let otp = Math.floor(Math.random() * 900000);
        readHTMLFile("./templates/registration.html", async function (err, html) {
          if (err) {
            return res.status(500).json({ status: false, message: "Sorry, Some errors during processing please contact admin" });
          }
          var template = handlebars.compile(html);
          const replacements = {
            otp: otp
          };

          htmlToSend = template(replacements);
          // Send confirmation email
          await mailer.sendEmail(
            req.body.email,
            "Verification For Login",
            htmlToSend
          )
          await CatererModel.findOneAndUpdate({ email: req.body.email.toLowerCase() }, { otp: otp }).exec();
          return res.status(200).json({ status: true, message: "Check your email for verification code." });
        });
      }
      else {
        return res.status(401).json({ status: false, message: "Password is incorrect" });
      }
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.otpVerificationCatererLogin = async (req, res) => {
  try {
    if (!req.body.email || !req.body.otp) {
      return res.status(404).json({ status: false, message: "Email or OTP or new Password is missing!" });
    }
    else {
      CatererModel.findOne({ email: req.body.email.toLowerCase() }).then(async (user) => {
        if (user) {
          if (user.otp == req.body.otp) {
            await CatererModel.findOneAndUpdate({ email: req.body.email.toLowerCase() }, { otp: null }).exec();
            let userData = {
              _id: user._id,
              idCard: user.idCard,
              phone: user.phone,
              email: user.email,
              merchantName: user.merchantName,
              ownerName: user.ownerName,
              type: "caterer"
            };

            //Prepare JWT token for authentication
            const jwtPayload = userData;
            const jwtData = {
              expiresIn: process.env.JWT_TIMEOUT_DURATION,
            };
            userData.token = jwt.sign(jwtPayload, process.env.JWT_SECRET_KEY, jwtData);
            return res.status(200).json({ status: true, message: "Verified and Successfully Login", data: userData });
          } else {
            return res.status(401).json({ status: false, message: "Invalid Verification Code." });
          }
        } else {
          return res.status(401).json({ status: false, message: "Sorry, We don't know this email address!" });
        }
      });
    }
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
}

exports.getEmployee = async (req, res) => {
  try {
    let data = await CatererModel.find({ owner: req.user._id }).lean().exec();
    if (data) {
      return res.status(200).json({ status: true, data });
    }
    else {
      return res.status(500).json({ status: false, message: "Employees not found." });
    }
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  };
};

exports.addEmployee = async (req, res) => {
  try {
    console.log(req.user)
    if (req.user.type !== "caterer") {
      return res.status(500).json({ status: false, message: "Only Caterer can Add Employees" });
    }

    if (!req.body.name || !req.body.email || !req.body.phone || !req.body.idCard || !req.body.pin || !req.body.role) {
      return res.status(500).json({ status: false, message: "Name or Email or Phone or IdCard or PIN or Role is Missing" });
    }
    let check = await CatererModel.findOne({ owner: req.user._id, email: req.body.email.toLowerCase() }).lean().exec();
    if (check) {
      return res.status(500).json({ status: false, message: "Employee Already Exists With this Email" });
    }
    else {
      await new CatererModel({
        name: req.body.name,
        owner: req.user._id,
        email: req.body.email.toLowerCase(),
        phone: req.body.phone,
        idCard: req.body.idCard,
        pin: req.body.pin,
        role: req.body.role,
        type: "employee",
      }).save();
      return res.status(200).json({ status: true, message: "Employee Added Successfully" });
    }

  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  };
};

exports.updateEmployee = async (req, res) => {
  try {
    if (req.user.type !== "caterer") {
      return res.status(500).json({ status: false, message: "Only Caterer can Update Employee details." });
    }
    if (!req.body.id) {
      return res.status(404).json({ status: false, message: "Employee id is Necessary" });
    }
    await CatererModel.findOneAndUpdate({ _id: req.body.id }, req.body).exec()
    return res.status(200).json({ status: true, message: "Employee Details Updated Successfully" });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    if (req.user.type !== "caterer") {
      return res.status(500).json({ status: false, message: "Only Caterer can delete Employees" });
    }
    if (!req.body.id) {
      return res.status(404).json({ status: false, message: "Employee id is Necessary" });
    }

    await CatererModel.findOneAndDelete({ _id: req.body.id }).exec()
    return res.status(200).json({ status: true, message: "Employee Delete Successfully" });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.searchEmployee = async (req, res) => {
  try {
    let data = await CatererModel.find({ name: { '$regex': req.body.employee, "$options": "i" }, type: "employee" }, "open catererId email merchantName address name type role phone").lean().exec();
    return res.status(200).json({ status: true, message: "Employee", data });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.employeeWRTId = async (req, res) => {
  try {
    let data = await CatererModel.findOne({ _id: req.params.id }).lean().exec();
    return res.status(200).json({ status: true, message: "Employee", data });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.getCaterer = async (req, res) => {
  try {
    let data = await CatererModel.find({ type: "caterer", status: "approved" }, "open catererId email merchantName address").skip((parseInt(req.body.page) - 1) * parseInt(req.body.size)).limit(parseInt(req.body.size)).lean().exec()
    if (data) {
      return res.status(200).json({ status: true, data });
    }
    else {
      return res.status(500).json({ status: false, message: "Caterers not found" });
    }
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  };
};

exports.getAllCaterers = async (req, res) => {
  try {

    console.log("req.body ", req.body)
    let page = parseInt(req.body.page);
    let limit = parseInt(req.body.size);
    const sortBy = req.body.sortBy
    const orderBy = req.body.orderBy
    // let page = parseInt(req.query.page);
    // let limit = parseInt(req.query.size);
    // const sortBy = req.query.sortBy
    // const orderBy = req.query.orderBy

    if (req.user.type !== 'admin') {
      return res.status(500).json({ status: true, message: "Only admin can fetch this" });
    }
    let totalCaterersCount = await CatererModel.countDocuments({}).exec();
    let data = await CatererModel.find({}, "open status catererId email merchantName address").skip((page - 1) * limit).limit(limit).sort(`${orderBy === "desc" ? "-" : ""}${sortBy}`).lean().exec();
    return res.status(200).json({ status: true, message: "All Caterers", data, totalCaterersCount });

  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.getAllCaterersByStatus = async (req, res) => {
  try {

    console.log("req.body ", req.body)
    let page = parseInt(req.body.page);
    let limit = parseInt(req.body.size);
    // let page = parseInt(req.query.page);
    // let limit = parseInt(req.query.size);
    // const sortBy = req.query.sortBy
    // const orderBy = req.query.orderBy

    if (req.user.type !== 'admin') {
      return res.status(500).json({ status: true, message: "Only admin can fetch this" });
    }

    if (!req.body.status) {
      return res.status(404).json({ status: true, message: "status is required" });
    }
    let totalCaterersCount = await CatererModel.countDocuments({ status: req.body.status }).exec();
    let data = await CatererModel.find({ status: req.body.status }, "open status catererId email merchantName address").skip((page - 1) * limit).limit(limit).lean().exec();
    return res.status(200).json({ status: true, message: "All Caterers", data, totalCaterersCount });

  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.catererDetails = async (req, res) => {
  try {
    let active = await SubscriptionModel.countDocuments({ status: "active" }).lean().exec();
    let request = await SubscriptionModel.countDocuments({ status: "request" }).lean().exec();
    let complete = await SubscriptionModel.countDocuments({ status: "complete" }).lean().exec();
    let data = await CatererModel.findOne({ _id: req.body.id }, "-password -pin -type -otp -__v").lean().exec()
    return res.status(200).json({ status: true, details: { active, request, complete, data } });

  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  };
};

exports.getCatererWRTStatus = async (req, res) => {
  try {
    let data;
    if (req.params.status == "all") {
      data = await CatererModel.find({ type: "caterer" }, "time status catererId email merchantName address").skip((parseInt(req.body.page) - 1) * parseInt(req.body.size)).limit(parseInt(req.body.size)).lean().exec()
    }
    else {
      data = await CatererModel.find({ type: "caterer", status: req.params.status }, "time status catererId email merchantName address").skip((parseInt(req.body.page) - 1) * parseInt(req.body.size)).limit(parseInt(req.body.size)).lean().exec()
    }
    if (data) {
      return res.status(200).json({ status: true, data });
    }
    else {
      return res.status(500).json({ status: false, message: "Caterers not found" });
    }
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  };
};


exports.updateCatererStatus = async (req, res) => {
  try {
    if (req.user.type !== "admin") {
      return res.status(500).json({ status: false, message: "Only Admin can change status of caterer." });
    }
    if (!req.body.id) {
      return res.status(404).json({ status: false, message: "Caterer id is Necessary" });
    }
    await CatererModel.findOneAndUpdate({ _id: req.body.id }, { status: req.body.status }).exec()
    return res.status(200).json({ status: true, message: "Updated Successfully" });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};


// For Admin
exports.catererDetailsFinance = async (req, res) => {
  try {
    let caterer = await CatererModel.findOne({ _id: req.body.id }, "open catererId email merchantName address").lean().exec();
    if (caterer) {
      let CompletedSubscription = await SubscriptionModel.find({ caterer: req.body.id, status: "completed" }, "price").lean().exec();
      let totalBalance = (CompletedSubscription && CompletedSubscription.length > 0) ? CompletedSubscription.reduce((a, b) => parseFloat(a.price) + parseFloat(b.price), 0) : 0;

      let from = new Date(Date.now() - 13 * 7 * 24 * 60 * 60 * 1000);
      let to = new Date(Date.now());

      let widthdraw = [
        {
          id: 232131321,
          remain: 200,
          widthdraw: 100,
          date: "2023-12-03T06:13:57.725+00:00"
        },
        {
          id: 232131321,
          remain: 300,
          widthdraw: 100,
          date: "2023-11-03T06:13:57.725+00:00"
        },
        {
          id: 232131321,
          remain: 400,
          widthdraw: 100,
          date: "2023-10-03T06:13:57.725+00:00"
        },
        {
          id: 232131321,
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
                  { _id: "null", amount: { $sum: "$price" } }
              },
              { $project: { _id: 0, "amount": 1 } },
            ],
            week2: [
              { "$match": { "updatedAt": { "$gte": new Date(Date.now() - 11 * 7 * 24 * 60 * 60 * 1000), "$lt": new Date(Date.now() - 10 * 7 * 24 * 60 * 60 * 1000) } } },
              {
                $group:
                  { _id: "null", amount: { $sum: "$price" } }
              },
              { $project: { _id: 0, "amount": 1 } },
            ],
            week3: [
              { "$match": { "updatedAt": { "$gte": new Date(Date.now() - 10 * 7 * 24 * 60 * 60 * 1000), "$lt": new Date(Date.now() - 9 * 7 * 24 * 60 * 60 * 1000) } } },
              {
                $group:
                  { _id: "null", amount: { $sum: "$price" } }
              },
              { $project: { _id: 0, "amount": 1 } },
            ],
            week4: [
              { "$match": { "updatedAt": { "$gte": new Date(Date.now() - 9 * 7 * 24 * 60 * 60 * 1000), "$lt": new Date(Date.now() - 8 * 7 * 24 * 60 * 60 * 1000) } } },
              {
                $group:
                  { _id: "null", amount: { $sum: "$price" } }
              },
              { $project: { _id: 0, "amount": 1 } },
            ],
            week5: [
              { "$match": { "updatedAt": { "$gte": new Date(Date.now() - 8 * 7 * 24 * 60 * 60 * 1000), "$lt": new Date(Date.now() - 7 * 7 * 24 * 60 * 60 * 1000) } } },
              {
                $group:
                  { _id: "null", amount: { $sum: "$price" } }
              },
              { $project: { _id: 0, "amount": 1 } },
            ],
            week6: [
              { "$match": { "updatedAt": { "$gte": new Date(Date.now() - 7 * 7 * 24 * 60 * 60 * 1000), "$lt": new Date(Date.now() - 6 * 7 * 24 * 60 * 60 * 1000) } } },
              {
                $group:
                  { _id: "null", amount: { $sum: "$price" } }
              },
              { $project: { _id: 0, "amount": 1 } },
            ],
            week7: [
              { "$match": { "updatedAt": { "$gte": new Date(Date.now() - 6 * 7 * 24 * 60 * 60 * 1000), "$lt": new Date(Date.now() - 5 * 7 * 24 * 60 * 60 * 1000) } } },
              {
                $group:
                  { _id: "null", amount: { $sum: "$price" } }
              },
              { $project: { _id: 0, "amount": 1 } },
            ],
            week8: [
              { "$match": { "updatedAt": { "$gte": new Date(Date.now() - 5 * 7 * 24 * 60 * 60 * 1000), "$lt": new Date(Date.now() - 4 * 7 * 24 * 60 * 60 * 1000) } } },
              {
                $group:
                  { _id: "null", amount: { $sum: "$price" } }
              },
              { $project: { _id: 0, "amount": 1 } },
            ],
            week9: [
              { "$match": { "updatedAt": { "$gte": new Date(Date.now() - 4 * 7 * 24 * 60 * 60 * 1000), "$lt": new Date(Date.now() - 3 * 7 * 24 * 60 * 60 * 1000) } } },
              {
                $group:
                  { _id: "null", amount: { $sum: "$price" } }
              },
              { $project: { _id: 0, "amount": 1 } },
            ],
            week10: [
              { "$match": { "updatedAt": { "$gte": new Date(Date.now() - 3 * 7 * 24 * 60 * 60 * 1000), "$lt": new Date(Date.now() - 2 * 7 * 24 * 60 * 60 * 1000) } } },
              {
                $group:
                  { _id: "null", amount: { $sum: "$price" } }
              },
              { $project: { _id: 0, "amount": 1 } },
            ],
            week11: [
              { "$match": { "updatedAt": { "$gte": new Date(Date.now() - 2 * 7 * 24 * 60 * 60 * 1000), "$lt": new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
              {
                $group:
                  { _id: "null", amount: { $sum: "$price" } }
              },
              { $project: { _id: 0, "amount": 1 } },
            ],
            week12: [
              { "$match": { "updatedAt": { "$gte": new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
              {
                $group:
                  { _id: "null", amount: { $sum: "$price" } }
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
      if (!caterer.addedBalance) {
        AddedBalance = "0.00"
      }
      else {
        AddedBalance = caterer.addedBalance
      }
      return res.status(200).json({ status: true, details: { caterer, totalBalance, AddedBalance, dataFrom: from, dataTo: to, widthdrawHistory: widthdraw, paymentWeeklyReport } });
    }
    else {
      return res.status(404).json({ status: false, message: "Caterer not found" });
    }



  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  };
};

exports.allCaterersSubscription = async (req, res) => {
  try {
    let caterer = await CatererModel.findOne({ _id: req.body.id }, "catererId").lean().exec();
    let subs = await SubscriptionModel.find({ caterer: req.body.id }, "deliveryTime price period createdAt").sort({ createdAt: -1 }).skip((parseInt(req.body.page) - 1) * parseInt(req.body.size)).limit(parseInt(req.body.size)).lean().exec();

    let subscription = [];

    for await (let sub of subs) {
      let temp = {};
      temp.Id = caterer.catererId;
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
    let data = await CatererModel.findOne({ _id: req.body.id }, "addedBalance").lean().exec();
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
    await CatererModel.findOneAndUpdate({ _id: req.body.id }, { $push: { addedBalanceHistory: temp }, addedBalance: addAmount }).lean().exec();

    return res.status(200).json({ status: true, message: "Sucessfully Added" });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.getmakeAdjustmentDetails = async (req, res) => {
  try {
    let data = await CatererModel.findOne({ _id: req.body.id }, "addedBalanceHistory").lean().exec();
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
    const data = await CatererModel.find({ merchantName: { $regex: '^' + req.body.search, $options: 'i' } }, "open status catererId email merchantName address").lean().exec();
    return res.status(200).json({ status: true, message: "success", data });
  } catch (error) {
    res.status(500).json({ success: false, message: "something went wrong", error: error.toString() });
  }
}



function Revenue(a, b) {
  if (a > 0 && b > 0) {
    return ((a - b) / b) * 100
  }
  else if (a == 0 && b > 0) {
    return -100
  }
  else if (a > 0 && b == 0) {
    return 100
  }
  else {
    return 0
  }
}

exports.dashManager = async (req, res) => {
  try {
    let date = new Date(moment().subtract(new Date().getDate() - 1, 'days').format("YYYY-MM-DD"))
    let lastMonthDate = new Date(moment(date).subtract(1, 'month').format("YYYY-MM-DD"))

    let CompletedSubscription = await SubscriptionModel.find({ caterer: req.body.catererId, status: "completed", updatedAt: { $gt: date } }, "price").lean().exec();
    let CompletedSubscriptionLast = await SubscriptionModel.find({ caterer: req.body.catererId, status: "completed", updatedAt: { $gt: lastMonthDate, $lt: date } }, "price").lean().exec();

    let totalBalance = (CompletedSubscription && CompletedSubscription.length > 0) ? CompletedSubscription.reduce((a, b) => parseFloat(a.price) + parseFloat(b.price), 0) : 0;
    let totalBalance2 = (CompletedSubscriptionLast && CompletedSubscriptionLast.length > 0) ? CompletedSubscriptionLast.reduce((a, b) => parseFloat(a.price) + parseFloat(b.price), 0) : 0;

    let totalBalancePercent = Revenue(totalBalance, totalBalance2);

    let activeSubscription = await SubscriptionModel.countDocuments({ caterer: req.body.catererId, status: "active" }).lean().exec();
    let activeSubscription2 = await SubscriptionModel.countDocuments({ caterer: req.body.catererId, activeDate: { $gt: lastMonthDate, $lt: date } }).lean().exec();

    let activeSubscriptionPercent = Revenue(activeSubscription, activeSubscription2);

    let pauseSubscription = await SubscriptionModel.countDocuments({ caterer: req.body.catererId, "pause.to": { $gt: date } }).lean().exec();
    let pauseSubscription2 = await SubscriptionModel.countDocuments({ caterer: req.body.catererId, $and: [{ "pause.to": { $gt: lastMonthDate } }, { "pause.from": { $gt: date } }] }).lean().exec();

    let pauseSubscriptionPercent = Revenue(pauseSubscription, pauseSubscription2)

    let singleSubscription = await SubscriptionModel.countDocuments({ caterer: req.body.catererId, period: "single", activeDate: { $gt: date } }).lean().exec();
    let singleSubscription2 = await SubscriptionModel.countDocuments({ caterer: req.body.catererId, period: "single", activeDate: { $gt: lastMonthDate, $lt: date } }).lean().exec();

    let singleSubscriptionPercent = Revenue(singleSubscription, singleSubscription2)

    let subscription = await SubscriptionModel.find({ caterer: req.body.catererId }).lean().exec();
    let todayDate = new Date().getDate();
    let salesChart = []
    let TopSellingMealPlanID = []
    let TopSellingMealPlan = []
    let TopSellingMP = []

    let dietary = await SubscriptionModel.countDocuments({ caterer: req.body.catererId, type: "dietary" }).lean().exec();
    let multiple = await SubscriptionModel.countDocuments({ caterer: req.body.catererId, type: "multiple" }).lean().exec();
    let single = await SubscriptionModel.countDocuments({ caterer: req.body.catererId, type: "single" }).lean().exec();
    let bussiness = await SubscriptionModel.countDocuments({ caterer: req.body.catererId, type: "bussiness" }).lean().exec();
    let personal = await SubscriptionModel.countDocuments({ caterer: req.body.catererId, type: "personal" }).lean().exec();

    let total = dietary + multiple + personal + bussiness + single;


    let allSubscriptions = {
      dietary: (total > 0 && dietary > 0) ? (dietary / total) * 100 : 0,
      multiple: (total > 0 && multiple > 0) ? (multiple / total) * 100 : 0,
      personal: (total > 0 && personal > 0) ? (personal / total) * 100 : 0,
      bussiness: (total > 0 && bussiness > 0) ? (bussiness / total) * 100 : 0,
      single: (total > 0 && single > 0) ? (single / total) * 100 : 0
    }
    if (subscription && subscription.length > 0) {
      for (let i = 1; i <= todayDate; i++) {
        let d = new Date(moment().subtract((todayDate - i), 'days').format("YYYY-MM-DD"))
        console.log(d)
        let count = subscription.filter(x => x.to > d && x.from < d)
        salesChart.push({ date: d, count: (count && count.length > 0) ? count.length : 0 })
      }
    }
    for (let i = 0; i < subscription.length; i++) {
      if (subscription[i]) {
        for (let j = 0; j < subscription[i].mealPlane.length; j++) {
          TopSellingMealPlan.push(subscription[i].mealPlane[j].mealPlanId.valueOf())
        }
      }
    }

    for (let i = 0; i < TopSellingMealPlan.length; i++) {
      if (TopSellingMealPlanID.filter(x => x == TopSellingMealPlan[i]).length < 1) {
        TopSellingMealPlanID.push(TopSellingMealPlan[i]);
      }
    }

    let MP = await MealPlanModel.find({ _id: { $in: TopSellingMealPlanID } }, "name").lean().exec();

    for (let c = 0; c < MP.length; c++) {
      let count = TopSellingMealPlan.filter(x => x == MP[c]._id)
      TopSellingMP.push({ name: MP[c].name, count: (count && count.length > 0) ? count.length : 0 })
    }
    return res.status(200).json({ status: true, message: "success", data: { totalBalance, singleSubscriptionPercent, totalBalancePercent, activeSubscriptionPercent, pauseSubscriptionPercent, activeSubscription, activeSubscription, pauseSubscription, singleSubscription, salesChart, TopSellingMP, allSubscriptions } });
  } catch (error) {
    res.status(500).json({ success: false, message: "something went wrong", error: error.toString() });
  }
}

exports.dashStaff = async (req, res) => {
  try {
    if (!req.body.catererId) {
      return res.status(404).json({ status: false, message: "Id or Subsciption Detail is missing" });
    }
    let allOrder = await SubscriptionModel.countDocuments({ caterer: req.body.catererId, status: "active" }).lean().exec();
    let mealPlane = await MealPlanModel.find({ owner: req.body.catererId }).lean().exec();
    let dish = await DishModel.countDocuments({ owner: req.body.catererId }).lean().exec();

    let countMealCourse = 0;
    let countAddOnes = 0;

    for (let i = 0; i < mealPlane.length; i++) {
      if (mealPlane[i] && mealPlane[i].mealCourse && mealPlane[i].mealCourse.length > 0) {
        countMealCourse = countMealCourse + mealPlane[i].mealCourse.length;
      }
      if (mealPlane[i] && mealPlane[i].addOnes && mealPlane[i].addOnes.length > 0) {
        countAddOnes = countAddOnes + mealPlane[i].addOnes.length;
      }
    }

    let subscription = await SubscriptionModel.find({ caterer: req.body.catererId }).lean().exec();
    let todayDate = new Date().getDate();
    let salesChart = []
    let TopSellingMealPlanID = []
    let TopSellingMealPlan = []
    let TopSellingMP = []

    if (subscription && subscription.length > 0) {
      for (let i = 1; i <= todayDate; i++) {
        let d = new Date(moment().subtract((todayDate - i), 'days').format("YYYY-MM-DD"))
        console.log(d)
        let count = subscription.filter(x => x.to > d && x.from < d)
        salesChart.push({ date: d, count: (count && count.length > 0) ? count.length : 0 })
      }
    }
    for (let i = 0; i < subscription.length; i++) {
      if (subscription[i]) {
        for (let j = 0; j < subscription[i].mealPlane.length; j++) {
          TopSellingMealPlan.push(subscription[i].mealPlane[j].mealPlanId.valueOf())
        }
      }
    }

    for (let i = 0; i < TopSellingMealPlan.length; i++) {
      if (TopSellingMealPlanID.filter(x => x == TopSellingMealPlan[i]).length < 1) {
        TopSellingMealPlanID.push(TopSellingMealPlan[i]);
      }
    }

    let MP = await MealPlanModel.find({ _id: { $in: TopSellingMealPlanID } }, "name").lean().exec();

    for (let c = 0; c < MP.length; c++) {
      let count = TopSellingMealPlan.filter(x => x == MP[c]._id)
      TopSellingMP.push({ name: MP[c].name, count: (count && count.length > 0) ? count.length : 0 })
    }

    let dietary = await SubscriptionModel.countDocuments({ caterer: req.user._id, type: "dietary" }).lean().exec();
    let multiple = await SubscriptionModel.countDocuments({ caterer: req.user._id, type: "multiple" }).lean().exec();
    let single = await SubscriptionModel.countDocuments({ caterer: req.user._id, type: "single" }).lean().exec();
    let bussiness = await SubscriptionModel.countDocuments({ caterer: req.user._id, type: "bussiness" }).lean().exec();
    let personal = await SubscriptionModel.countDocuments({ caterer: req.user._id, type: "personal" }).lean().exec();

    let total = dietary + multiple + personal + bussiness + single;


    let allSubscriptions = {
      dietary: (total > 0 && dietary > 0) ? (dietary / total) * 100 : 0,
      multiple: (total > 0 && multiple > 0) ? (multiple / total) * 100 : 0,
      personal: (total > 0 && personal > 0) ? (personal / total) * 100 : 0,
      bussiness: (total > 0 && bussiness > 0) ? (bussiness / total) * 100 : 0,
      single: (total > 0 && single > 0) ? (single / total) * 100 : 0
    }
    return res.status(200).json({ status: true, message: "success", data: { allOrder, countAddOnes, countMealCourse, dish, salesChart, TopSellingMP, allSubscriptions } });
  } catch (error) {
    res.status(500).json({ success: false, message: "something went wrong", error: error.toString() });
  }
}