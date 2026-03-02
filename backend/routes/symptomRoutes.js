const express = require('express');
const router = express.Router();
const { checkSymptoms, getSymptomHistory } = require('../controllers/symptomController');
const protect = require('../middleware/auth');

// All symptom check routes are protected
router.use(protect);

router.post('/check', checkSymptoms);
router.get('/history', getSymptomHistory);

module.exports = router;
