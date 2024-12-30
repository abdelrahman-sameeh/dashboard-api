const express = require("express");
const {
  login,
  sendResetCode,
  forgetPassword,
  isAuth,
  changePassword,
  getLoggedUser,
  register,
  removeUser,
} = require("../controllers/auth.controllers");
const {
  registerValidator,
  loginValidator,
  forgetPasswordValidator,
  changePasswordValidator,
} = require("../validators/auth.validator");

const router = express.Router();

router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);
router.post("/resetCode", sendResetCode);
router.post("/forgetPassword", forgetPasswordValidator, forgetPassword);
router.post("/changePassword", isAuth, changePasswordValidator, changePassword);
router.get("/auth", isAuth, getLoggedUser);

router.delete("/user", isAuth, removeUser);

module.exports = router;
