// controllers/authController.js

const bcrypt = require('bcryptjs');
const User = require('../models/User');

const signup = async (req, res) => {
  const { username, password } = req.body;
  try {
    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  signup,
  login,
};
