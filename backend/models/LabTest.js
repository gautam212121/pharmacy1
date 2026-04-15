const mongoose = require("mongoose");

const labTestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  healthConcern: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String }, // store image URL
  keywords: { type: [String], default: [] },
  symptoms: { type: [String], default: [] },
  indications: { type: [String], default: [] },
  discount: { type: Number, default: 0, min: 0, max: 100 }, // discount percentage
  rating: { type: Number, default: 0, min: 0, max: 5 }, // test rating
  reviews: [
    {
      userId: String,
      userName: String,
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("LabTest", labTestSchema);
