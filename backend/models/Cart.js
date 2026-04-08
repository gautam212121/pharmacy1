const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      title: String,
      qty: { type: Number, default: 1 },
      price: Number,
    },
  ],
});

module.exports = mongoose.model("Cart", cartSchema);
