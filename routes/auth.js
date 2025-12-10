const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Helper function to sign JWT
const signToken = (user) => {
  return new Promise((resolve, reject) => {
    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'jwtSecret',
      { expiresIn: process.env.JWT_EXPIRES_IN || 3600 },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    );
  });
};

// @route   POST /api/auth/signup
// @desc    Register user
// @access  Public
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({ name, email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const token = await signToken(user);
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = await signToken(user);
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Social auth routes
const socialAuthCallback = async (req, res) => {
  try {
    const token = await signToken(req.user);
   res.redirect(`${process.env.CLIENT_URL}?token=${token}`);


  } catch (err) {
    console.error(err.message);
     return res.redirect(`${process.env.CLIENT_URL}/login`);
  }
};

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), socialAuthCallback);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/' }), socialAuthCallback);

router.get('/linkedin', passport.authenticate('linkedin'));
router.get('/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/' }), socialAuthCallback);

// @route   GET /api/auth/user
// @desc    Get current user
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
