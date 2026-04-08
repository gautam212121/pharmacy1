const express = require("express");
const router = express.Router();
const LabTest = require("../models/LabTest");
const multer = require("multer");
const path = require("path");

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Get all lab tests
router.get("/", async (req, res) => {
  try {
    const tests = await LabTest.find();
    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get lab test by ID
router.get("/:id", async (req, res) => {
  try {
    const test = await LabTest.findById(req.params.id);
    if (!test) return res.status(404).json({ message: "Lab test not found" });
    res.json(test);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add a new lab test
router.post("/", async (req, res) => {
  try {
    const { name, healthConcern, price, discount, image } = req.body;
    const newTest = new LabTest({
      name,
      healthConcern,
      price,
      image: image || null,
      discount: discount || 0,
    });

    await newTest.save();
    res.status(201).json(newTest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update lab test
router.put("/:id", async (req, res) => {
  try {
    const updates = req.body;

    const updated = await LabTest.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) return res.status(404).json({ message: "Lab test not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add review/rating to lab test
router.post("/:id/review", async (req, res) => {
  try {
    const { userId, userName, rating, comment } = req.body;
    const test = await LabTest.findById(req.params.id);

    if (!test) return res.status(404).json({ message: "Lab test not found" });

    // Add review
    test.reviews.push({ userId, userName, rating, comment });

    // Calculate average rating
    const totalRating = test.reviews.reduce((sum, r) => sum + r.rating, 0);
    test.rating = parseFloat((totalRating / test.reviews.length).toFixed(2));

    await test.save();
    res.status(201).json({ message: "Review added successfully", test });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a lab test
router.delete("/:id", async (req, res) => {
  try {
    await LabTest.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
