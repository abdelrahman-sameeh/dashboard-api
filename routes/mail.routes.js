const express = require("express");
const {} = require("../controllers/mail.controllers");
const { isAuth, allowTo } = require("../controllers/auth.controllers");
const { sendMail } = require("../controllers/mail.controllers");
const upload = require("../utils/uploadFiles");

const router = express.Router();

router.post(
  "/send-mail",
  isAuth,
  allowTo("admin"),
  upload.single('cv'),
  sendMail
);

module.exports = router;
