const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const router = express.Router();
const otpStore = new Map();

const normalizeEmail = (value = '') => value.trim().toLowerCase();
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendEmailOtp = async ({ email, otp }) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log(`Demo email OTP for ${email}: ${otp}`);
    return { demoMode: true };
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || smtpUser,
    to: email,
    subject: 'WELD CRM OTP Verification',
    text: `Your WELD CRM verification code is ${otp}. It is valid for 5 minutes.`,
  });

  return { demoMode: false };
};

router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Email is required for email verification' });
    }

    const otp = generateOtp();
    const key = `email:${normalizedEmail}`;
    otpStore.set(key, {
      code: otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      verified: false,
    });

    const delivery = await sendEmailOtp({ email: normalizedEmail, otp });

    const response = { message: `OTP sent successfully to ${normalizedEmail}` };
    if (delivery.demoMode) response.demoOtp = otp;
    return res.json(response);
  } catch (error) {
    if (error.responseCode === 535 || /BadCredentials|Username and Password not accepted/i.test(error.message || '')) {
      return res.status(502).json({
        message: 'Gmail rejected the SMTP credentials. Generate a new Gmail app password and update backend/.env.',
      });
    }

    return res.status(500).json({ message: error.message || 'Unable to send OTP' });
  }
});

router.post('/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const key = `email:${normalizedEmail}`;
    const otpEntry = otpStore.get(key);

    if (!otpEntry || otpEntry.expiresAt < Date.now()) {
      otpStore.delete(key);
      return res.status(400).json({ message: 'OTP expired or invalid. Please request a new one.' });
    }

    if (String(otpEntry.code) !== String(otp)) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    otpEntry.verified = true;
    otpStore.set(key, otpEntry);
    return res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword, otp } = req.body;

    if (!username || !email || !password || !confirmPassword || !otp) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = normalizeEmail(email);

    if (normalizedUsername.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const key = `email:${normalizedEmail}`;
    const otpEntry = otpStore.get(key);

    if (!otpEntry || !otpEntry.verified || otpEntry.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Please verify your OTP before registering' });
    }

    if (String(otpEntry.code) !== String(otp)) {
      return res.status(400).json({ message: 'OTP does not match' });
    }

    const existingUser = await User.findOne({
      $or: [{ username: normalizedUsername.toLowerCase() }, { email: normalizedEmail }],
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: normalizedUsername.toLowerCase(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    otpStore.delete(key);

    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    return res.status(201).json({ token, user: { username: user.username } });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }

    return res.status(500).json({ message: error.message });
  }
});

router.get('/me', async (req, res) => {
  try {
    const authorization = req.headers.authorization || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(payload.userId).select('username email');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user: { username: user.username, email: user.email } });
  } catch (error) {
    return res.status(401).json({ message: 'Session expired. Please log in again.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const normalizedUsername = (username || '').trim().toLowerCase();

    if (!normalizedUsername || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findOne({ username: normalizedUsername });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    return res.json({ token, user: { username: user.username, email: user.email } });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;