const express = require('express');
const router = express.Router();
const { createSOS, getEmergencyHistory, resolveEmergency } = require('../controllers/emergencyController');
const protect = require('../middleware/auth');

// All emergency routes are protected
router.use(protect);

router.post('/sos', createSOS);
router.get('/history', getEmergencyHistory);
router.put('/:id/resolve', resolveEmergency);

module.exports = router;
