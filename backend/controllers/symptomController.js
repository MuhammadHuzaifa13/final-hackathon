const SymptomCheck = require('../models/SymptomCheck');

/**
 * @desc    Check symptoms (AI Placeholder)
 * @route   POST /api/symptoms/check
 * @access  Private
 */
exports.checkSymptoms = async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ success: false, message: 'Please provide a query' });
        }

        // Mock AI Logic (In a real app, this would call OpenAI/Gemini API)
        let response = "Based on your description, it could be a common cold. However, please consult a doctor for a proper diagnosis.";
        let severity = 'Low';
        let recommendation = "Rest and stay hydrated. Monitor your temperature.";

        if (query.toLowerCase().includes('chest pain')) {
            response = "Chest pain can be serious. Please seek immediate medical attention.";
            severity = 'Emergency';
            recommendation = "Call emergency services or go to the nearest ER immediately.";
        } else if (query.toLowerCase().includes('fever') && query.toLowerCase().includes('cough')) {
            response = "These are common symptoms of a viral infection, possibly a flu or COVID-19.";
            severity = 'Medium';
            recommendation = "Get tested for COVID-19 and consult a physician if symptoms persist.";
        }

        const symptomCheck = await SymptomCheck.create({
            user: req.user._id,
            query,
            response,
            severity,
            recommendation,
        });

        res.status(201).json({
            success: true,
            data: symptomCheck,
        });
    } catch (error) {
        console.error('Symptom Check Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @desc    Get symptom check history
 * @route   GET /api/symptoms/history
 * @access  Private
 */
exports.getSymptomHistory = async (req, res) => {
    try {
        const checks = await SymptomCheck.find({ user: req.user._id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: checks.length,
            data: checks,
        });
    } catch (error) {
        console.error('Get Symptom History Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
