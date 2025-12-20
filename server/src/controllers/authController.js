// src/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

exports.signup = async (req, res) => {
  try {
    const { password, primaryRole } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      ...req.body,
      password: hashedPassword,
      accountStatus: primaryRole === 'parent' ? 'approved' : 'pending'
    });

    res.status(201).json({
      message: primaryRole === 'parent'
        ? 'Signup successful'
        : 'Signup successful. Await admin approval',
      userId: user._id
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

  if (user.accountStatus !== 'approved') {
    return res.status(403).json({ message: 'Account not approved by admin' });
  }

  const token = generateToken(user);

  res.json({
    token,
    role: user.primaryRole
  });
};
