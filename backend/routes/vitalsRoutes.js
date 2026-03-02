const express = require('express');
const router = express.Router();
const { addVitals, getVitals, getLatestVitals, deleteVitals } = require('../controllers/vitalsController');
const protect = require('../middleware/auth');

// All vitals routes are protected
router.use(protect);

router.post('/', addVitals);
router.get('/', getVitals);
router.get('/latest', getLatestVitals);
router.delete('/:id', deleteVitals);

module.exports = router;
