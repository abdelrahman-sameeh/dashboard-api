const { default: mongoose } = require("mongoose");

const mailSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.ObjectId,
      ref: "Client",
      require: true,
    },
    admin: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      require: true,
    },
    package: {
      type: mongoose.Schema.ObjectId,
      ref: "Package",
      require: true,
    },
    companyEmail: String,
    companyName: String,
    companyActivity: String,
    companyLocation: String,
    status: Boolean
  },
  { timestamps: true }
);

const Mail = mongoose.model("Mail", mailSchema);

module.exports = Mail;
