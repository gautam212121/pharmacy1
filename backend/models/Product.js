const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    image: { type: String, required: true }, // image URL or path
    category: { type: String, required: true }, // new category field
    discount: { type: Number, default: 0, min: 0, max: 100 }, // discount percentage
    rating: { type: Number, default: 0, min: 0, max: 5 }, // product rating
    reviews: [
      {
        userId: String,
        userName: String,
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
