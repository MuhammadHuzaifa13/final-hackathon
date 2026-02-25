const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount
} = require('../controllers/userController');

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', getProfile);

// @route   PUT /api/user/update
// @desc    Update user profile
// @access  Private
router.put('/update', updateProfile);

// @route   PUT /api/user/change-password
// @desc    Change password
// @access  Private
router.put('/change-password', changePassword);

// @route   DELETE /api/user/delete
// @desc    Delete user account
// @access  Private
router.delete('/delete', deleteAccount);

module.exports = router;
