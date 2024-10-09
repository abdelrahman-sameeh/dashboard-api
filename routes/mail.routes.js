const express = require("express");
const { isAuth, allowTo } = require("../controllers/auth.controllers");
const { sendMail } = require("../controllers/mail.controllers");
const upload = require("../utils/uploadFiles");

const router = express.Router();

router.post(
  "/send-mail",
  isAuth,
  allowTo("admin"),
  upload('cvs').single('cv'),
  sendMail
);

module.exports = router;
