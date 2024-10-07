const { default: mongoose } = require("mongoose");

const clientSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
  },
  registerCount: Number
}, {timestamps: true})

const Client = mongoose.model('Client', clientSchema)

module.exports = Client
