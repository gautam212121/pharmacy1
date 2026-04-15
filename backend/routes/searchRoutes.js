const express = require("express");
const Product = require("../models/Product");
const LabTest = require("../models/LabTest");

const router = express.Router();

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

router.get("/", async (req, res) => {
  try {
    const query = (req.query.q || "").trim();
    if (!query) {
      return res.json({ products: [], labTests: [] });
    }

    const regex = new RegExp(escapeRegex(query), "i");

    const productFilters = [
      { title: regex },
      { description: regex },
      { category: regex },
      { keywords: regex },
      { symptoms: regex },
      { indications: regex },
    ];

    const labTestFilters = [
      { name: regex },
      { healthConcern: regex },
      { keywords: regex },
      { symptoms: regex },
      { indications: regex },
    ];

    const [products, labTests] = await Promise.all([
      Product.find({ $or: productFilters }).limit(50),
      LabTest.find({ $or: labTestFilters }).limit(50),
    ]);

    res.json({ products, labTests });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Unable to perform search" });
  }
});

module.exports = router;
