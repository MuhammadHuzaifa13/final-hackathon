const db = require('../utils/db');

// @desc    Get all medical records for a user
// @route   GET /api/records
// @access  Private
const getRecords = async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;

    // Get all records for user
    let records = await db.find('records', { user: req.user.id });

    // Filter by type
    if (type) {
      records = records.filter(r => r.recordType === type);
    }

    // Sort by createdAt desc
    records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const total = records.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginatedRecords = records.slice(startIndex, startIndex + parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        records: paginatedRecords,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get records error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching medical records',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get a single medical record
// @route   GET /api/records/:id
// @access  Private
const getRecord = async (req, res) => {
  try {
    const record = await db.findOne('records', { _id: req.params.id, user: req.user.id });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        record
      }
    });
  } catch (error) {
    console.error('Get record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching medical record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create a new medical record
// @route   POST /api/records
// @access  Private
const createRecord = async (req, res) => {
  try {
    const { title, description, recordType, fileUrl, fileName, fileSize } = req.body;

    // Validate required fields
    if (!title || !description || !recordType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and record type'
      });
    }

    // Create new record
    const record = await db.create('records', {
      user: req.user.id,
      title,
      description,
      recordType,
      fileUrl: fileUrl || '',
      fileName: fileName || '',
      fileSize: fileSize || 0
    });

    res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      data: {
        record
      }
    });
  } catch (error) {
    console.error('Create record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating medical record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update a medical record
// @route   PUT /api/records/:id
// @access  Private
const updateRecord = async (req, res) => {
  try {
    const recordId = req.params.id;
    const { title, description, recordType, fileUrl, fileName, fileSize } = req.body;

    const record = await db.findOne('records', { _id: recordId, user: req.user.id });
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    const update = {};
    if (title) update.title = title;
    if (description) update.description = description;
    if (recordType) update.recordType = recordType;
    if (fileUrl !== undefined) update.fileUrl = fileUrl;
    if (fileName !== undefined) update.fileName = fileName;
    if (fileSize !== undefined) update.fileSize = fileSize;

    const updated = await db.findByIdAndUpdate('records', recordId, update);

    res.status(200).json({
      success: true,
      message: 'Medical record updated successfully',
      data: {
        record: updated
      }
    });
  } catch (error) {
    console.error('Update record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating medical record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete a medical record
// @route   DELETE /api/records/:id
// @access  Private
const deleteRecord = async (req, res) => {
  try {
    const deleted = await db.findByIdAndDelete('records', req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Medical record deleted successfully'
    });
  } catch (error) {
    console.error('Delete record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting medical record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get record statistics
// @route   GET /api/records/stats
// @access  Private
const getRecordStats = async (req, res) => {
  try {
    const records = await db.find('records', { user: req.user.id });

    // Manual aggregation
    const typeCounts = {};
    records.forEach(r => {
      typeCounts[r.recordType] = (typeCounts[r.recordType] || 0) + 1;
    });

    const typeBreakdown = Object.keys(typeCounts).map(type => ({
      type,
      count: typeCounts[type]
    }));

    res.status(200).json({
      success: true,
      data: {
        totalRecords: records.length,
        typeBreakdown
      }
    });
  } catch (error) {
    console.error('Get record stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching record statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  getRecordStats
};
