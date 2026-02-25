const db = require('../utils/db');

// @desc    Book a new appointment
// @route   POST /api/appointments/book
// @access  Private
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;

    // Validate input
    if (!doctorId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Please provide doctorId, date, and time'
      });
    }

    // Check if doctor exists and is active
    const doctor = await db.findOne('doctors', { _id: doctorId });
    if (!doctor || !doctor.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or not available'
      });
    }

    // Parse and validate date
    const appointmentDate = new Date(date);
    if (appointmentDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date must be in the future'
      });
    }

    // Check if the time is within doctor's available time slots
    const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });
    if (!doctor.availableDays.includes(dayOfWeek)) {
      return res.status(400).json({
        success: false,
        message: `Doctor is not available on ${dayOfWeek}`
      });
    }

    // Check for appointment clash
    const appointments = await db.read('appointments');
    const clash = appointments.find(a =>
      a.doctor === doctorId &&
      a.date === date &&
      a.time === time &&
      ['confirmed', 'pending'].includes(a.status)
    );

    if (clash) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked. Please choose another time.'
      });
    }

    // Create new appointment
    const appointment = await db.create('appointments', {
      user: req.user.id,
      doctor: doctorId,
      date,
      time,
      reason: reason || '',
      status: 'pending'
    });

    // Manually "populate" doctor details for the response
    const populatedAppointment = {
      ...appointment,
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        specialization: doctor.specialization,
        email: doctor.email,
        phone: doctor.phone
      }
    };

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: {
        appointment: populatedAppointment
      }
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during appointment booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get upcoming appointments
// @route   GET /api/appointments/upcoming
// @access  Private
const getUpcomingAppointments = async (req, res) => {
  try {
    const appointments = await db.find('appointments', { user: req.user.id });
    const doctors = await db.read('doctors');

    const currentDate = new Date();

    // Manual populate and filter
    const upcoming = appointments
      .filter(a => {
        const appointmentDateTime = new Date(`${a.date}T${a.time}`);
        return appointmentDateTime >= currentDate && ['confirmed', 'pending'].includes(a.status);
      })
      .map(a => ({
        ...a,
        doctor: doctors.find(d => d._id === a.doctor)
      }))
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
      });

    res.status(200).json({
      success: true,
      data: {
        appointments: upcoming,
        count: upcoming.length
      }
    });
  } catch (error) {
    console.error('Get upcoming appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching upcoming appointments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get appointment history
// @route   GET /api/appointments/history
// @access  Private
const getAppointmentHistory = async (req, res) => {
  try {
    const appointments = await db.find('appointments', { user: req.user.id });
    const doctors = await db.read('doctors');

    const currentDate = new Date();

    const history = appointments
      .filter(a => {
        const appointmentDateTime = new Date(`${a.date}T${a.time}`);
        return appointmentDateTime < currentDate || ['completed', 'cancelled'].includes(a.status);
      })
      .map(a => ({
        ...a,
        doctor: doctors.find(d => d._id === a.doctor)
      }))
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateB - dateA; // Sort descending
      });

    res.status(200).json({
      success: true,
      data: {
        appointments: history,
        count: history.length
      }
    });
  } catch (error) {
    console.error('Get appointment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching appointment history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Cancel an appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
const cancelAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const appointment = await db.findOne('appointments', { _id: appointmentId });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if the appointment belongs to the current user
    if (appointment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment'
      });
    }

    // Check if appointment can be cancelled (only if it's not in the past)
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
    if (appointmentDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel past appointments'
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already cancelled'
      });
    }

    const updatedAppointment = await db.findByIdAndUpdate('appointments', appointmentId, { status: 'cancelled' });

    // Manually "populate" doctor details for the response
    const doctor = await db.findOne('doctors', { _id: updatedAppointment.doctor });
    const populatedAppointment = {
      ...updatedAppointment,
      doctor: doctor ? {
        _id: doctor._id,
        name: doctor.name,
        specialization: doctor.specialization,
        email: doctor.email,
        phone: doctor.phone
      } : null
    };

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: {
        appointment: populatedAppointment
      }
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error cancelling appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get available doctors
// @route   GET /api/appointments/doctors
// @access  Private
const getAvailableDoctors = async (req, res) => {
  try {
    const doctors = await db.find('doctors', { isActive: true });

    // Select specific fields for response
    const filteredDoctors = doctors.map(doctor => ({
      _id: doctor._id,
      name: doctor.name,
      specialization: doctor.specialization,
      email: doctor.email,
      phone: doctor.phone,
      availableDays: doctor.availableDays,
      availableTimeSlots: doctor.availableTimeSlots
    })).sort((a, b) => a.name.localeCompare(b.name));

    res.status(200).json({
      success: true,
      data: {
        doctors: filteredDoctors,
        count: filteredDoctors.length
      }
    });
  } catch (error) {
    console.error('Get available doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching available doctors',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get available time slots for a doctor on a specific date
// @route   GET /api/appointments/available-slots/:doctorId/:date
// @access  Private
const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.params;

    // Validate doctor
    const doctor = await db.findOne('doctors', { _id: doctorId });
    if (!doctor || !doctor.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or not available'
      });
    }

    // Parse date
    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });

    // Check if doctor is available on this day
    if (!doctor.availableDays.includes(dayOfWeek)) {
      return res.status(400).json({
        success: false,
        message: `Doctor is not available on ${dayOfWeek}`
      });
    }

    // Get all booked slots for this doctor on this date
    const allAppointments = await db.read('appointments');
    const bookedTimes = allAppointments
      .filter(apt =>
        apt.doctor === doctorId &&
        apt.date === date &&
        ['confirmed', 'pending'].includes(apt.status)
      )
      .map(apt => apt.time);

    // Generate all possible time slots (30-minute intervals)
    const allSlots = [];
    doctor.availableTimeSlots.forEach(slot => {
      const [startHour, startMin] = slot.start.split(':').map(Number);
      const [endHour, endMin] = slot.end.split(':').map(Number);

      let currentHour = startHour;
      let currentMin = startMin;

      while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
        const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
        allSlots.push(timeString);

        // Add 30 minutes
        currentMin += 30;
        if (currentMin >= 60) {
          currentMin = 0;
          currentHour++;
        }
      }
    });

    // Filter out booked slots
    const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

    res.status(200).json({
      success: true,
      data: {
        availableSlots,
        date: appointmentDate,
        doctor: {
          name: doctor.name,
          specialization: doctor.specialization
        }
      }
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching available slots',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  bookAppointment,
  getUpcomingAppointments,
  getAppointmentHistory,
  cancelAppointment,
  getAvailableDoctors,
  getAvailableSlots
};
