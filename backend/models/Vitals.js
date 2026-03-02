const mongoose = require('mongoose');

const vitalsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['Heart Rate', 'Blood Pressure', 'Steps', 'Sleep', 'Weight', 'Temperature'],
        required: true,
    },
    value: {
        type: String, // e.g., '72', '120/80'
        required: true,
    },
    unit: {
        type: String, // e.g., 'BPM', 'mmHg', 'Steps'
    },
    date: {
        type: Date,
        default: Date.now,
    },
    note: {
        type: String,
    },
});

module.exports = mongoose.model('Vitals', vitalsSchema);
