const Product = require("../models/Product");

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Add product
exports.addProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const saved = await newProduct.save();
    // ✅ product object return करो
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update product (including discount)
exports.updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "🗑 Product deleted", deletedId: deleted?._id });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Add review/rating to product
exports.addReview = async (req, res) => {
  try {
    const { userId, userName, rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    // Add review
    product.reviews.push({ userId, userName, rating, comment });

    // Calculate average rating
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = parseFloat((totalRating / product.reviews.length).toFixed(2));

    await product.save();
    res.status(201).json({ message: "Review added successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
