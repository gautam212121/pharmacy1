// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

const getAdminUsernames = () => {
  const envList = (process.env.ADMIN_USERNAMES || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set(["ajeet21", "admin", ...envList]));
};

const isAdminUsername = (username) => getAdminUsernames().includes(String(username || "").trim().toLowerCase());

const createUserResponse = (user) => ({
  user: {
    username: user.username,
    role: user.role,
  },
});

// Signup route
async function handleSignup(req, res) {
  try {
    const { username, password, role } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 8);
    const nextRole = role === "admin" && isAdminUsername(username) ? "admin" : "user";
    const newUser = new User({ username, password: hashedPassword, role: nextRole });
    await newUser.save();

    res.status(201).json({
      message: "Account created successfully",
      ...createUserResponse(newUser),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

router.post("/register", handleSignup);
router.post("/signup", handleSignup);

// Login route
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: "Invalid username or password" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: "Invalid username or password" });

    if (isAdminUsername(username) && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    res.json(createUserResponse(user));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
