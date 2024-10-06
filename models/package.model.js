const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    capacity: { type: Number, required: true },
    price: { type: Number, required: true },
    file: { type: String, required: true },
  },
  { timestamps: true }
);

packageSchema.post('save', async function(doc) {
  await doc.populate({path: 'admin', select: 'name email'});
});

const Package = mongoose.model("Package", packageSchema);

module.exports = Package;
