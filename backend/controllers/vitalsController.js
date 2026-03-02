const Vitals = require('../models/Vitals');

/**
 * @desc    Add new vitals record
 * @route   POST /api/vitals
 * @access  Private
 */
exports.addVitals = async (req, res) => {
    try {
        const { type, value, unit, date, note } = req.body;

        const vitals = await Vitals.create({
            user: req.user._id,
            type,
            value,
            unit,
            date: date || Date.now(),
            note,
        });

        res.status(201).json({ success: true, data: vitals });
    } catch (error) {
        console.error('Add Vitals Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @desc    Get vitals history (filtered by type)
 * @route   GET /api/vitals
 * @access  Private
 */
exports.getVitals = async (req, res) => {
    try {
        const { type, limit } = req.query;
        const query = { user: req.user._id };
        if (type) query.type = type;

        const vitals = await Vitals.find(query)
            .sort({ date: -1 })
            .limit(parseInt(limit) || 100);

        res.status(200).json({ success: true, count: vitals.length, data: vitals });
    } catch (error) {
        console.error('Get Vitals Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @desc    Get latest vitals for each type (Dashboard overview)
 * @route   GET /api/vitals/latest
 * @access  Private
 */
exports.getLatestVitals = async (req, res) => {
    try {
        const types = ['Heart Rate', 'Blood Pressure', 'Steps', 'Sleep', 'Weight', 'Temperature'];
        const latestVitals = {};

        for (const type of types) {
            const latest = await Vitals.findOne({ user: req.user._id, type }).sort({ date: -1 });
            latestVitals[type] = latest || null;
        }

        res.status(200).json({ success: true, data: latestVitals });
    } catch (error) {
        console.error('Get Latest Vitals Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @desc    Delete vitals record
 * @route   DELETE /api/vitals/:id
 * @access  Private
 */
exports.deleteVitals = async (req, res) => {
    try {
        const vitals = await Vitals.findById(req.params.id);

        if (!vitals) {
            return res.status(404).json({ success: false, message: 'Vitals record not found' });
        }

        if (vitals.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        await vitals.deleteOne();
        res.status(200).json({ success: true, message: 'Vitals record removed' });
    } catch (error) {
        console.error('Delete Vitals Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
