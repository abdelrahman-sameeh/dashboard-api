const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

// عدد الإيميلات المرسلة اليوم/أسبوع/شهر
router.get('/dashboard/mails-count', dashboardController.getEmailsCount);

// نسبة الإيميلات اللي اتبعتت بنجاح أو فشلت
router.get('/dashboard/mails-status', dashboardController.getEmailsStatus);

// إحصائيات المستخدمين
router.get('/dashboard/clients-stats', dashboardController.getClientsStats);

// عدد الـ packages المتاحة
router.get('/dashboard/packages-count', dashboardController.getPackagesCount);


module.exports = router;
