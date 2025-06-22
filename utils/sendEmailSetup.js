const nodemailer = require("nodemailer");
const sgMail = require("@sendgrid/mail");
const fs = require("fs");
const { logErrorToFile } = require("./logger");
const {
  SENDGRID_API_KEY,
  SEND_GRID_EMAIL="HR@saajobs.com",
  SEND_EMAIL_USER_CHECK,
  SEND_EMAIL_PASS_CHECK,
} = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

const _sendEmailWithSendGrid = async (to, subject, text, html, attachments) => {
  const msg = {
    to,
    from: `'منصة سعى' <${SEND_GRID_EMAIL}>`,
    subject,
    mailSettings: {
      sandboxMode: {
        enable: process.env.MODE=='dev'
      }
    }
  };

  if (text) msg.text = text;
  if (html) msg.html = html;

  if (attachments.length) {
    msg.attachments = attachments.map((attachment) => {
      const filePath = attachment.path;
      const fileContent = fs.readFileSync(filePath).toString("base64");
      return {
        content: fileContent,
        filename: attachment.filename,
        type: "application/pdf",
        disposition: "attachment",
      };
    });
  }

  try {
    const response = await sgMail.send(msg);
    return { message: "success", status: true };
  } catch (error) {
    console.log(error, to);
    console.log('-----------------------------------------------');
    logErrorToFile(error, "SendGrid Email");
    return { message: error.message, status: false };
  }
};

const _sendEmailWithNodemailer = async (
  to,
  subject = "test",
  text = "test"
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: SEND_EMAIL_USER_CHECK,
      pass: SEND_EMAIL_PASS_CHECK,
    },
  });

  const mailOptions = {
    from: SEND_EMAIL_USER_CHECK,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { message: "success", status: true };
  } catch (error) {
    return { message: error.message, status: false };
  }
};

// الدالة الرئيسية لإرسال الإيميل بناءً على قيمة check
exports.sendEmail = async (
  check = false,
  to,
  subject,
  text = "",
  html = "",
  attachments = []
) => {
  if (!check) {
    // استخدم SendGrid
    return await _sendEmailWithSendGrid(to, subject, text, html, attachments);
  } else {
    // استخدم Nodemailer
    return await _sendEmailWithNodemailer(to, subject, text);
  }
};
