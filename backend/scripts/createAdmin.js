// createAdmin.js
// Usage: node backend/scripts/createAdmin.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Use the same connection string as server.js
// use same URI as server; fall back to localhost
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/pharmacyDB';

async function run() {
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const username = 'ajeet21';
  const rawPassword = '12345';

  const existing = await User.findOne({ username });
  if (existing) {
    console.log('User exists. Ensuring role=admin and updating password...');
    const hash = await bcrypt.hash(rawPassword, 10);
    existing.password = hash;
    existing.role = 'admin';
    await existing.save();
    console.log('Updated existing user to admin:', username);
    process.exit(0);
  }

  const hash = await bcrypt.hash(rawPassword, 10);
  const user = new User({ username, password: hash, role: 'admin' });
  await user.save();
  console.log('Admin user created:', username);
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
