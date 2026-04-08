const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const createToken = (user) => jwt.sign(
  { userId: user._id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendRegistrationOtp = async ({ email, name, otp }) => {
  await transporter.sendMail({
    from: `"AttendEase" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your AttendEase account',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: auto; background: #0f0f0f; color: #fff; border-radius: 12px; padding: 32px;">
        <h2 style="color: #f59e0b; margin-bottom: 8px;">AttendEase</h2>
        <p style="color: #aaa; font-size: 14px;">Attendance Management System</p>
        <hr style="border-color: #222; margin: 20px 0;" />
        <p>Hi <strong>${name}</strong>,</p>
        <p>Use this OTP to complete your registration:</p>
        <div style="background: #1a1a1a; border: 2px solid #f59e0b; border-radius: 8px; text-align: center; padding: 20px; margin: 20px 0;">
          <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #f59e0b;">${otp}</span>
        </div>
        <p style="color: #aaa; font-size: 13px;">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
      </div>
    `
  });
};

const sendRegistrationOtpWithTimeout = ({ email, name, otp }) =>
  Promise.race([
    sendRegistrationOtp({ email, name, otp }),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OTP email request timed out')), 15000);
    })
  ]);

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser?.isVerified) {
      return res.status(409).json({ error: 'User already exists. Please log in.' });
    }

    let user = existingUser;
    if (!user) {
      user = new User({
        name: trimmedName,
        email: normalizedEmail,
        password,
        otp: { code: otp, expiresAt },
        isVerified: false
      });
    } else {
      user.name = trimmedName;
      user.password = password;
      user.otp = { code: otp, expiresAt };
      user.isVerified = false;
    }

    await user.save();
    try {
      await sendRegistrationOtpWithTimeout({ email: normalizedEmail, name: trimmedName, otp });
    } catch (emailError) {
      console.error('OTP email error:', emailError);
      return res.status(502).json({
        error: 'Could not send OTP email right now. Please try again in a moment.'
      });
    }

    res.status(201).json({
      message: 'OTP sent successfully. Verify to complete registration.',
      email: normalizedEmail
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/verify-registration
router.post('/verify-registration', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ error: 'Registration not found. Please register first.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Account already verified. Please log in.' });
    }

    if (!user.isOtpValid(otp)) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    const token = createToken(user);

    res.json({
      message: 'Registration successful',
      token,
      user: { _id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Verify registration error:', err);
    res.status(500).json({ error: 'OTP verification failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please register first.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please verify your account with OTP before logging in.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = createToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: { _id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: { _id: req.user._id, name: req.user.name, email: req.user.email } });
});

module.exports = router;
