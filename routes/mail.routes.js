const express = require("express");
const { isAuth, allowTo } = require("../controllers/auth.controllers");
const { sendMail, getClientMails, checkMail } = require("../controllers/mail.controllers");
const upload = require("../utils/uploadFiles");

const router = express.Router();

router
  .post(
    "/mails",
    isAuth,
    allowTo("admin"),
    upload("cvs").single("cv"),
    sendMail
  )
  .get("/mails/client/:id", isAuth, allowTo("admin"), getClientMails);

router.post('/check-mail', isAuth, allowTo('admin'), checkMail)

module.exports = router;
