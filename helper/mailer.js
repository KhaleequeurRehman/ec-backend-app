var nodemailer = require("nodemailer");
var sendgridTransport = require('nodemailer-sendgrid-transport');

var transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: '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',
        domain: "em7893.eatcoast.ca"
    }
}));

module.exports.sendEmail = (to,subject,html)=>{

    var mailOptions = {
        from: 'EatCoast <no-reply@eatcoast.ca>',
        to: to,
        subject:subject,
        html: html
    };

    transporter.sendMail(mailOptions, function (error, info) {
        console.log(error, info)
    });
}

module.exports.sendEmail2 = (from,to,subject,text)=>{
    console.log(from,to,subject,text)
    var mailOptions = {
        from: from,
        to: to,
        subject:subject,
        text: text
    };

    transporter.sendMail(mailOptions, function (error, info) {
        console.log(error, info)
    });
}

module.exports.sendEmailWithAttachment = (from,to,subject,html,attachment)=>{
    var mailOptions = {
        from: from,
        to: to,
        subject:subject,
        html: html,
        attachments: attachment
    };

    transporter.sendMail(mailOptions, function (error, info) {
        console.log(error, info)
    });
}