const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId },
  title: { type: String, required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  discount: { type: Number, default: 0 },
});

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    address: { type: String, required: true },
    items: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["credit-card", "debit-card", "upi", "net-banking", "wallet", "cod"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    orderType: {
      type: String,
      enum: ["product", "lab-test", "doctor-consultation"],
      default: "product",
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Shipped", "Delivered"],
      default: "Pending",
    },
    // Additional fields for lab tests
    age: { type: Number },
    gender: { type: String },
    testType: { type: String },
    // Additional field for doctor appointments
    doctorType: { type: String },
    // Linked customer username
    username: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
