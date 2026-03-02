const MedicalRecord = require('../models/MedicalRecord');

// @desc    Get all medical records for a user
// @route   GET /api/records
// @access  Private
const getRecords = async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;

    // Get all records for user
    // Build query
    const query = { user: req.user.id };
    if (type) {
      query.recordType = type;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await MedicalRecord.countDocuments(query);
    const records = await MedicalRecord.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        records,
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
    const record = await MedicalRecord.findOne({ _id: req.params.id, user: req.user.id });

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
    console.log('--- CREATE RECORD REQUEST RECEIVED ---');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    const { title, description, recordType, fileUrl, fileName, fileSize } = req.body;

    // Validate required fields
    if (!title || !description || !recordType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and record type'
      });
    }

    // Create new record
    const record = new MedicalRecord({
      user: req.user.id,
      title,
      description,
      recordType,
      fileUrl: fileUrl || '',
      fileName: fileName || '',
      fileSize: fileSize || 0
    });

    await record.save();

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

    const updated = await MedicalRecord.findOneAndUpdate(
      { _id: recordId, user: req.user.id },
      { $set: req.body },
      { new: true }
    );

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
    const deleted = await MedicalRecord.findOneAndDelete({ _id: req.params.id, user: req.user.id });
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
    const totalRecords = await MedicalRecord.countDocuments({ user: req.user.id });
    const typeBreakdown = await MedicalRecord.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: '$recordType', count: { $sum: 1 } } },
      { $project: { type: '$_id', count: 1, _id: 0 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRecords,
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
