const asyncHandler = require("../middlewares/asyncHandler");
const Package = require("../models/package.model");
const Client = require("../models/client.model");
const Mail = require("../models/mail.model");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const ApiError = require("../utils/ApiError");
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
    return newItem;
  });

// Helper function to add or update a client
const _addClient = async (name, email) => {
  const existingClient = await Client.findOne({ name, email });

  if (existingClient) {
    existingClient.registerCount += 1;
    await existingClient.save();
    return existingClient._id;
  } else {
    const newClient = new Client({
      name,
      email,
      registerCount: 1,
    });
    await newClient.save();
    return newClient._id;
  }
};

// Helper function to remove file if it exists
const _removeFileIfExists = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Error removing file: ${filePath}`, err);
    });
  }
};

// Helper function to read Excel file and return translated data
const _readExcelSheet = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return _translatedData(xlsx.utils.sheet_to_json(worksheet));
};

// Helper function to send emails and log the result
const _sendEmailsToCompanies = async (
  translatedData,
  mailSubject,
  mailBody,
  attachments,
  clientId,
  adminId,
  packageId
) => {
  for (let i = 0; i < 4; i++) {
    const companyData = translatedData[i];
    const emailSent = await sendEmail(
      companyData.email,
      mailSubject,
      null,
      mailBody,
      attachments
    );

    // Save email status
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
  }
};

const sendMail = asyncHandler(async (req, res, next) => {
  const { clientName, clientEmail, mailSubject, mailBody, package: packageId } =
    req.body;
  const file = req.file;
  let attachments = [];

  // Handle CV file if provided
  const cvFilePath = file ? path.join(__dirname, "..", file.path) : null;
  if (file && cvFilePath && fs.existsSync(cvFilePath)) {
    attachments.push({ filename: file.filename, path: cvFilePath });
  }

  // Find the package
  const package = await Package.findById(packageId);
  if (!package) {
    _removeFileIfExists(cvFilePath);
    return next(new ApiError("package not found", 404));
  }

  // Check for the package Excel file
  const excelSheetPath = path.join(
    __dirname,
    "..",
    "uploads",
    "packages",
    package.file
  );
  if (!fs.existsSync(excelSheetPath)) {
    _removeFileIfExists(cvFilePath);
    return next(new ApiError("package file not found", 404));
  }

  // Read the Excel file and send emails
  const translatedData = _readExcelSheet(excelSheetPath);
  const clientId = await _addClient(clientName, clientEmail);
  await _sendEmailsToCompanies(
    translatedData,
    mailSubject,
    mailBody,
    attachments,
    clientId,
    req.user._id,
    package._id
  );

  // Cleanup CV file if it exists
  _removeFileIfExists(cvFilePath);

  res.status(200).json({ message: "mails sent successfully" });
});

module.exports = {
  sendMail,
};
