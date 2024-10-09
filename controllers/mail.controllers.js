const asyncHandler = require("../middlewares/asyncHandler");
const Package = require("../models/package.model");
const Client = require("../models/client.model");
const Mail = require("../models/mail.model");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const ApiError = require("../utils/ApiError");
const awsConfig = require("../config/aws.config");
const { sendEmail } = require("../utils/sendEmailSetup");

// Function to translate JSON keys
const _translatedData = (jsonData) =>
  jsonData.map((item) => {
    const newItem = {};
    for (const key in item) {
      let newKey = key;

      if (key.includes("مقر")) {
        newKey = "location";
      } else if (key.includes("نشاط")) {
        newKey = "activity";
      } else if (key.includes("ايميل")) {
        newKey = "email";
      } else if (key.includes("اسم")) {
        newKey = "name";
      }

      newItem[newKey] = item[key];
    }
    return newItem; // Return the newly mapped object
  });

// Helper function to add or update a client
const _addClient = async (name, email) => {
  const existingClient = await Client.findOne({ name, email });

  if (existingClient) {
    existingClient.registerCount += 1;
    await existingClient.save();
    return existingClient._id; // Return the existing client's ID
  } else {
    const newClient = new Client({
      name,
      email,
      registerCount: 1,
    });
    await newClient.save();
    return newClient._id; // Return the new client's ID
  }
};

const sendMail = asyncHandler(async (req, res, next) => {
  const { clientName, clientEmail, mailSubject, mailBody } = req.body;
  let attachments = [];
  const cvFilePath = path.join(__dirname, "..", req.file.path);

  if (fs.existsSync(cvFilePath)) {
    attachments = [
      {
        filename: req.file.filename,
        path: cvFilePath,
      },
    ];
  }

  const package = await Package.findById(req.body.package);

  if(!package){
    return next(new ApiError('package not found', 404))
  }

  const excelSheetPath = path.join(
    __dirname,
    "..",
    "uploads",
    "packages",
    package.file
  );

  if (!fs.existsSync(excelSheetPath)) {
    return next(new ApiError("package file not found", 404));
  }

  const workbook = xlsx.readFile(excelSheetPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(worksheet);
  const translated = _translatedData(jsonData);
  const clientId = await _addClient(clientName, clientEmail);

  for (let i = 0; i < 4; i++) {
    const companyData = translated[i];
    const emailSent = await sendEmail(companyData.email, mailSubject, null, mailBody, attachments);
    // // Save email status
    await Mail.create({
      client: clientId,
      admin: req.user._id,
      package: package._id,
      companyEmail: companyData.email,
      companyName: companyData.name,
      companyActivity: companyData.activity,
      companyLocation: companyData.location,
      status: emailSent.status,
    });
  }

  // remove cv attachments
  if(req.file){
    fs.unlink(cvFilePath, (err) => {});
  }

  res.status(200).json({
    message: "mails send successfully",
  });
});

module.exports = {
  sendMail,
};
