const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'senderModel',
        required: true,
    },
    senderModel: {
        type: String,
        required: true,
        enum: ['User', 'Doctor'],
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'receiverModel',
        required: true,
    },
    receiverModel: {
        type: String,
        required: true,
        enum: ['User', 'Doctor'],
    },
    text: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Message', messageSchema);
