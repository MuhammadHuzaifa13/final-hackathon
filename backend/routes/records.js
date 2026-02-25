const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  getRecordStats
} = require('../controllers/recordController');

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   GET /api/records
// @desc    Get all medical records for a user
// @access  Private
router.get('/', getRecords);

// @route   GET /api/records/stats
// @desc    Get record statistics
// @access  Private
router.get('/stats', getRecordStats);

// @route   GET /api/records/:id
// @desc    Get a single medical record
// @access  Private
router.get('/:id', getRecord);

// @route   POST /api/records
// @desc    Create a new medical record
// @access  Private
router.post('/', createRecord);

// @route   PUT /api/records/:id
// @desc    Update a medical record
// @access  Private
router.put('/:id', updateRecord);

// @route   DELETE /api/records/:id
// @desc    Delete a medical record
// @access  Private
router.delete('/:id', deleteRecord);

module.exports = router;
