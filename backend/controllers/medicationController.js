const Medication = require('../models/Medication');

/**
 * @desc    Add new medication
 * @route   POST /api/medications
 * @access  Private
 */
exports.addMedication = async (req, res) => {
    try {
        const { name, dosage, frequency, times, startDate, endDate, instruction } = req.body;

        const medication = await Medication.create({
            user: req.user._id,
            name,
            dosage,
            frequency,
            times,
            startDate,
            endDate,
            instruction,
        });

        res.status(201).json({ success: true, data: medication });
    } catch (error) {
        console.error('Add Medication Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @desc    Get all medications for a user
 * @route   GET /api/medications
 * @access  Private
 */
exports.getMedications = async (req, res) => {
    try {
        const medications = await Medication.find({ user: req.user._id, isActive: true }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: medications.length, data: medications });
    } catch (error) {
        console.error('Get Medications Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @desc    Update medication entry
 * @route   PUT /api/medications/:id
 * @access  Private
 */
exports.updateMedication = async (req, res) => {
    try {
        let medication = await Medication.findById(req.params.id);

        if (!medication) {
            return res.status(404).json({ success: false, message: 'Medication not found' });
        }

        if (medication.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        medication = await Medication.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({ success: true, data: medication });
    } catch (error) {
        console.error('Update Medication Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @desc    Track adherence (Mark as taken/missed)
 * @route   POST /api/medications/:id/track
 * @access  Private
 */
exports.trackAdherence = async (req, res) => {
    try {
        const { status, date } = req.body;
        const medication = await Medication.findById(req.params.id);

        if (!medication) {
            return res.status(404).json({ success: false, message: 'Medication not found' });
        }

        medication.adherence.push({ status, date: date || Date.now() });
        await medication.save();

        res.status(200).json({ success: true, data: medication });
    } catch (error) {
        console.error('Track Adherence Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @desc    Delete medication (Soft delete / Set inactive)
 * @route   DELETE /api/medications/:id
 * @access  Private
 */
exports.deleteMedication = async (req, res) => {
    try {
        const medication = await Medication.findById(req.params.id);

        if (!medication) {
            return res.status(404).json({ success: false, message: 'Medication not found' });
        }

        medication.isActive = false;
        await medication.save();

        res.status(200).json({ success: true, message: 'Medication removed' });
    } catch (error) {
        console.error('Delete Medication Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
