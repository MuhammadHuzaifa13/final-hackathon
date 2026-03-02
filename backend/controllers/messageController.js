const Message = require('../models/Message');
const Doctor = require('../models/Doctor');

/**
 * @desc    Send a message
 * @route   POST /api/messages
 * @access  Private
 */
exports.sendMessage = async (req, res) => {
    try {
        const { receiver, receiverModel, text } = req.body;

        const message = await Message.create({
            sender: req.user._id,
            senderModel: 'User',
            receiver,
            receiverModel,
            text,
        });

        res.status(201).json({ success: true, data: message });
    } catch (error) {
        console.error('Send Message Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @desc    Get conversation with a specific doctor/user
 * @route   GET /api/messages/:id
 * @access  Private
 */
exports.getConversation = async (req, res) => {
    try {
        const otherId = req.params.id;
        const userId = req.user._id;

        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: otherId },
                { sender: otherId, receiver: userId },
            ],
        }).sort({ createdAt: 1 });

        // Mark as read
        await Message.updateMany(
            { sender: otherId, receiver: userId, isRead: false },
            { isRead: true }
        );

        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        console.error('Get Conversation Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @desc    Get all chats for current user
 * @route   GET /api/messages/chats
 * @access  Private
 */
exports.getChats = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find all unique people the user has messaged
        const messages = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }],
        }).sort({ createdAt: -1 });

        const chatPartners = new Set();
        const chats = [];

        for (const msg of messages) {
            const partnerId = msg.sender.toString() === userId.toString() ? msg.receiver.toString() : msg.sender.toString();
            const partnerModel = msg.sender.toString() === userId.toString() ? msg.receiverModel : msg.senderModel;

            if (!chatPartners.has(partnerId)) {
                chatPartners.add(partnerId);

                let details = null;
                if (partnerModel === 'Doctor') {
                    details = await Doctor.findById(partnerId).select('name specialization');
                } else {
                    // In case of user-to-user, but here mostly User-Doctor
                    const User = require('../models/User');
                    details = await User.findById(partnerId).select('name');
                }

                chats.push({
                    partnerId,
                    partnerModel,
                    lastMessage: msg.text,
                    time: msg.createdAt,
                    isRead: msg.isRead,
                    partnerName: details ? details.name : 'Unknown',
                    specialization: details?.specialization || ''
                });
            }
        }

        res.status(200).json({ success: true, data: chats });
    } catch (error) {
        console.error('Get Chats Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
