const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Hardcoded admin credentials
const ADMIN_EMAILS = ['admin@weldshop.com', 'admin@weldingshop.com', 'admin@welding.com', 'admin'];
const ADMIN_PASSWORD = 'admin123';

// Login route
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = (email || '').toLowerCase();
  const validEmail = ADMIN_EMAILS.some((valid) => valid.toLowerCase() === normalizedEmail) || /^admin@welding/.test(normalizedEmail);

  if (!validEmail || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ email: normalizedEmail }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
  res.json({ token });
});

module.exports = router;