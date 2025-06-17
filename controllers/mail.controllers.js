const asyncHandler = require("../middlewares/asyncHandler");
const Package = require("../models/package.model");
const Client = require("../models/client.model");
const Mail = require("../models/mail.model");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const ApiError = require("../utils/ApiError");
const { sendEmail } = require("../utils/sendEmailSetup");
const Pagination = require("../utils/Pagination");
const emailQueue = require("../jobs/email-queue");
const dns = require("dns").promises;

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
  emailLanguage = "ar",
  translatedData = [],
  mailSubject,
  mailBody,
  attachments,
  clientId,
  adminId,
  packageId
) => {
  const html = `
  <html dir="${emailLanguage == "ar" ? "rtl" : "ltr"}">
  <head>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        width: 100%;
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
        line-height: 1.6;
        background-color: #f9f9f9;
      }
      .content {
        max-width: 100%;
        width: 100%;
        margin: 0 auto;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
      }
      .content p {
        margin-bottom: 10px;
        font-size: 16px;
        color: #333;
      }
      .rtl p{
      text-align: end;
      }
    </style>
  </head>
  <body>
    <div class="content ${emailLanguage == "ar" ? "rtl" : ""}">
      ${mailBody}
    </div>
  </body>
</html>
  `;

  translatedData.forEach((companyData) => {
    emailQueue.push({
      companyData,
      mailSubject,
      html,
      attachments,
      clientId,
      adminId,
      packageId,
    });
  });
};

const sendMail = asyncHandler(async (req, res, next) => {
  const {
    clientName,
    clientEmail,
    mailSubject,
    mailBody,
    package: packageId,
    emailLanguage,
  } = req.body;
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
    emailLanguage,
    translatedData,
    mailSubject,
    mailBody,
    attachments,
    clientId,
    req.user._id,
    package._id
  );

  // Cleanup CV file if it exists
  // _removeFileIfExists(cvFilePath);

  res.status(200).json({ message: "mails sent successfully" });
});

const getClientMails = asyncHandler(async (req, res) => {
  const { page, limit, sort, status } = req.query; // Get page, limit, sort, and status from query params
  const { id } = req.params; // Get client ID from URL params

  // Query to filter mails by client ID and status if provided
  const query = {
    client: id,
    ...(status !== undefined && { status: status }), // Filter by status if provided
  };

  // Fields to populate (admin and package)
  const populateFields = [
    { field: "admin", select: "name email" },
    { field: "package", select: "name capacity price" },
  ];

  // Create Pagination instance
  const pagination = new Pagination(
    "mails", // The name of the resource
    Mail, // Mongoose model
    query, // Query
    page, // Page
    limit, // Limit
    sort, // Sort
    populateFields // Fields to populate
  );

  // Get paginated results
  const results = await pagination.paginate();

  // Send the response
  res.status(200).json(results);
});

const checkMail = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new ApiError("Email is required", 400));
  }

  // Extract domain from email
  const domain = email.split("@")[1];
  if (!domain) {
    return next(new ApiError("invalid email format", 400));
  }

  try {
    const addresses = await dns.resolveMx(domain);
    if (!addresses.length) {
      return next(new ApiError("invalid email address", 400));
    }

    const emailResponse = await sendEmail(true, email);
    if (emailResponse.status) {
      return res.status(200).json({
        message: "email sent successfully",
        data: emailResponse.message,
      });
    } else {
      return res.status(400).json({
        message: "failed to send email",
        error: emailResponse.message,
      });
    }
  } catch (err) {
    return next(new ApiError("invalid email address", 400));
  }
};

const getNumberOfEmailQueueTasks = (req, res, next) => {
  const queueLength = emailQueue.length
  console.log(queueLength);
  
  return res.status(200).json({
    status: "success",
    data: queueLength
  })
};

module.exports = {
  sendMail,
  getClientMails,
  checkMail,
  getNumberOfEmailQueueTasks,
};
