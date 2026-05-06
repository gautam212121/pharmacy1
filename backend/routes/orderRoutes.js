const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Place order
router.post("/", async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      address,
      items,
      totalAmount,
      paymentMethod,
      paymentStatus,
      status,
      orderType,
      age,
      gender,
      testType,
      doctorType,
    } = req.body;

    if (!customerName || !customerPhone || !address || !items?.length) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    const resolvedOrderType =
      orderType ||
      (doctorType ? "doctor-consultation" : testType ? "lab-test" : "product");

    const order = new Order({
      customerName,
      customerPhone,
      address,
      items,
      totalAmount,
      paymentMethod,
      paymentStatus,
      status,
      orderType: resolvedOrderType,
      age,
      gender,
      testType,
      doctorType,
    });
    await order.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("new-order", order);
      io.emit("order-updated", order);
    }

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error("Order failed:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Accept order
router.put("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Reject order
router.delete("/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
