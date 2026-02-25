const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  bookAppointment,
  getUpcomingAppointments,
  getAppointmentHistory,
  cancelAppointment,
  getAvailableDoctors,
  getAvailableSlots
} = require('../controllers/appointmentController');

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   POST /api/appointments/book
// @desc    Book a new appointment
// @access  Private
router.post('/book', bookAppointment);

// @route   GET /api/appointments/upcoming
// @desc    Get upcoming appointments
// @access  Private
router.get('/upcoming', getUpcomingAppointments);

// @route   GET /api/appointments/history
// @desc    Get appointment history
// @access  Private
router.get('/history', getAppointmentHistory);

// @route   PUT /api/appointments/:id/cancel
// @desc    Cancel an appointment
// @access  Private
router.put('/:id/cancel', cancelAppointment);

// @route   GET /api/appointments/doctors
// @desc    Get available doctors
// @access  Private
router.get('/doctors', getAvailableDoctors);

// @route   GET /api/appointments/available-slots/:doctorId/:date
// @desc    Get available time slots for a doctor on a specific date
// @access  Private
router.get('/available-slots/:doctorId/:date', getAvailableSlots);

module.exports = router;
