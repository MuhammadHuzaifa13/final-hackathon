const mongoose = require('mongoose');

const symptomCheckSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    query: {
        type: String,
        required: true,
    },
    response: {
        type: String,
        required: true,
    },
    severity: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Emergency'],
        default: 'Low',
    },
    recommendation: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('SymptomCheck', symptomCheckSchema);
