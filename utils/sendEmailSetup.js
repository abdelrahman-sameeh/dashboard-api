const nodemailer = require("nodemailer");
const AWS = require("../config/aws.config");
const { AWS_SEND_EMAIL_USER } = process.env;

// Create Nodemailer transporter using AWS SES
const transporter = nodemailer.createTransport({
  SES: new AWS.SES({ apiVersion: "2010-12-01" }),
});

// Send email with attachment
exports.sendEmail = async (
  to,
  subject,
  text = "",
  html = "",
  attachments = []
) => {
  const mailOptions = {
    from: AWS_SEND_EMAIL_USER,
    to,
    subject: subject,
  };

  if (text) {
    mailOptions.text = text;
  }

  if (html) {
    mailOptions.html = html;
  }

  if (attachments.length) {
    mailOptions.attachments = attachments;
  }

  try {
    await transporter.sendMail(mailOptions);
    return { message: "success", status: true };
  } catch (err) {
    console.log(err);
    return { message: err.message, status: false };
  }
};
