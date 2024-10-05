const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      unique: [true, "email must be unique"],
    },
    password: String,
    resetCode: String,
    resetCodeExpire: Date,
    lastResetPasswordDate: Date,
    role: {
      type: String,
      default: "admin",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = {
  User,
};
