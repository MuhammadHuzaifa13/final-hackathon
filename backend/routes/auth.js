const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { signup, login, getMe } = require('../controllers/authController');

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', signup);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authMiddleware, getMe);

module.exports = router;
