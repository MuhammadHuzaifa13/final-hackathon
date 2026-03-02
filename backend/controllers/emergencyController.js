const Emergency = require('../models/Emergency');

/**
 * @desc    Create an SOS alert
 * @route   POST /api/emergency/sos
 * @access  Private
 */
exports.createSOS = async (req, res) => {
    try {
        const { location } = req.body;

        const emergency = await Emergency.create({
            user: req.user.id,
            type: 'SOS Alert',
            location,
        });

        res.status(201).json({ success: true, data: emergency });
    } catch (error) {
        console.error('Create SOS Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @desc    Get emergency history for user
 * @route   GET /api/emergency/history
 * @access  Private
 */
exports.getEmergencyHistory = async (req, res) => {
    try {
        const history = await Emergency.find({ user: req.user.id }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: history.length, data: history });
    } catch (error) {
        console.error('Get Emergency History Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @desc    Resolve/Close emergency alert
 * @route   PUT /api/emergency/:id/resolve
 * @access  Private
 */
exports.resolveEmergency = async (req, res) => {
    try {
        const emergency = await Emergency.findById(req.params.id);

        if (!emergency) {
            return res.status(404).json({ success: false, message: 'Emergency alert not found' });
        }

        emergency.status = 'Resolved';
        emergency.resolvedAt = Date.now();
        await emergency.save();

        res.status(200).json({ success: true, data: emergency });
    } catch (error) {
        console.error('Resolve Emergency Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
