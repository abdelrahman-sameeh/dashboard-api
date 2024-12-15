const Mail = require("../models/mail.model");
const Package = require("../models/package.model");
const Client = require("../models/client.model");
const asyncHandler = require("../middlewares/asyncHandler");
// عدد الإيميلات المرسلة اليوم/أسبوع/شهر
exports.getEmailsCount = asyncHandler(async (req, res) => {
  const period = req.query.period || "day"; // Default is 'day'
  let dateFrom;

  if (period === "day") {
    dateFrom = new Date();
    dateFrom.setHours(0, 0, 0, 0); // بداية اليوم
  } else if (period === "week") {
    dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 7); // آخر 7 أيام
  } else if (period === "month") {
    dateFrom = new Date();
    dateFrom.setMonth(dateFrom.getMonth() - 1); // آخر شهر
  }

  const count = await Mail.countDocuments({ createdAt: { $gte: dateFrom } });
  res.status(200).json({ count });
});

// نسبة الإيميلات اللي اتبعتت بنجاح أو فشلت
exports.getEmailsStatus = asyncHandler(async (req, res) => {
  const totalMails = await Mail.countDocuments();
  const successMails = await Mail.countDocuments({ status: true });
  const failedMails = totalMails - successMails;

  res.status(200).json({
    totalMails,
    successPercentage: (successMails / totalMails) * 100,
    failedPercentage: (failedMails / totalMails) * 100,
    successMails,
    failedMails,
  });
});

// إحصائيات المستخدمين
exports.getClientsStats = asyncHandler(async (req, res) => {
  const period = req.query.period || "week";
  let dateFrom = new Date();

  switch (period) {
    case "week":
      dateFrom.setDate(dateFrom.getDate() - 7);
      break;
    case "month":
      dateFrom.setMonth(dateFrom.getMonth() - 1);
      break;
    default:
      dateFrom.setHours(0, 0, 0, 0);
      break;
  }

  const newClients = await Client.countDocuments({
    createdAt: { $gte: dateFrom },
  });
  const totalClients = await Client.countDocuments();

  res.status(200).json({
    newClients,
    totalClients,
  });
});

// عدد الـ packages المتاحة
exports.getPackagesCount = asyncHandler(async (req, res) => {
  const packagesCount = await Package.countDocuments();
  res.status(200).json({ packagesCount });
});
