const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    dosage: {
        type: String,
        required: true,
    },
    frequency: {
        type: String, // e.g., 'Daily', 'Twice a day'
        required: true,
    },
    times: [{
        type: String, // e.g., '09:00', '21:00'
    }],
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
    },
    instruction: {
        type: String, // e.g., 'After meal'
    },
    adherence: [{
        date: { type: Date, default: Date.now },
        status: { type: String, enum: ['Taken', 'Missed', 'Skipped'], default: 'Taken' }
    }],
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Medication', medicationSchema);
