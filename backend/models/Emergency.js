const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['SOS Alert', 'Fall Detected', 'High Heart Rate'],
        default: 'SOS Alert',
    },
    location: {
        latitude: Number,
        longitude: Number,
        address: String,
    },
    status: {
        type: String,
        enum: ['Active', 'Resolved', 'Cancelled'],
        default: 'Active',
    },
    resolvedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Emergency', emergencySchema);
