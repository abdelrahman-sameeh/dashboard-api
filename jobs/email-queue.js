const BetterQueue = require('better-queue');
const MemoryStore = require('better-queue-memory');
const Mail = require('../models/mail.model');
const { sendEmail } = require('../utils/sendEmailSetup');
require('dotenv').config();

const emailQueue = new BetterQueue(async (task, cb) => {
  const {
    companyData,
    mailSubject,
    html,
    attachments,
    clientId,
    adminId,
    packageId
  } = task;

  try {
    const emailSent = await sendEmail(
      false,
      companyData.email,
      mailSubject,
      undefined,
      html,
      attachments
    );

    await Mail.create({
      client: clientId,
      admin: adminId,
      package: packageId,
      companyEmail: companyData.email,
      companyName: companyData.name,
      companyActivity: companyData.activity,
      companyLocation: companyData.location,
      status: emailSent.status,
    });

    cb(null, 'done');
  } catch (err) {
    console.error(`❌ Failed to send to ${companyData.email}:`, err.message);
  }
}, {
  store: new MemoryStore(),
  concurrent: 5, 
  afterProcessDelay: 1500 
});

module.exports = emailQueue;
