const express = require('express');
const router = express.Router();
const {
    addMedication,
    getMedications,
    updateMedication,
    trackAdherence,
    deleteMedication,
} = require('../controllers/medicationController');
const protect = require('../middleware/auth');

// All medication routes are protected
router.use(protect);

router.post('/', addMedication);
router.get('/', getMedications);
router.put('/:id', updateMedication);
router.post('/:id/track', trackAdherence);
router.delete('/:id', deleteMedication);

module.exports = router;
