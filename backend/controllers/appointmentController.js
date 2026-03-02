const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

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
    const doctor = await Doctor.findOne({ _id: doctorId, isActive: true });
    if (!doctor) {
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
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[appointmentDate.getDay()];
    if (!doctor.availableDays.includes(dayOfWeek)) {
      return res.status(400).json({
        success: false,
        message: `Doctor is not available on ${dayOfWeek}`
      });
    }

    // Check for appointment clash
    const clash = await Appointment.findOne({
      doctor: doctorId,
      date: new Date(date),
      time: time,
      status: { $in: ['confirmed', 'pending'] }
    });

    if (clash) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked. Please choose another time.'
      });
    }

    // Create new appointment
    const appointment = new Appointment({
      user: req.user.id,
      doctor: doctorId,
      date: new Date(date),
      time,
      reason: reason || '',
      status: 'confirmed' // Default to confirmed for hackathon simplicity
    });

    await appointment.save();

    // Populate doctor details
    const populatedAppointment = await Appointment.findById(appointment._id).populate('doctor', 'name specialization email phone');

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
    const appointments = await Appointment.find({
      user: req.user.id,
      date: { $gte: new Date().setHours(0, 0, 0, 0) },
      status: { $in: ['confirmed', 'pending'] }
    })
      .populate('doctor', 'name specialization email phone')
      .sort({ date: 1, time: 1 });

    res.status(200).json({
      success: true,
      data: {
        appointments,
        count: appointments.length
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
    const appointments = await Appointment.find({
      user: req.user.id,
      $or: [
        { date: { $lt: new Date().setHours(0, 0, 0, 0) } },
        { status: { $in: ['completed', 'cancelled'] } }
      ]
    })
      .populate('doctor', 'name specialization email phone')
      .sort({ date: -1, time: -1 });

    res.status(200).json({
      success: true,
      data: {
        appointments,
        count: appointments.length
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
    console.log(`Attempting to cancel appointment: ${req.params.id} for user: ${req.user.id}`);

    const deletedAppointment = await Appointment.findOneAndDelete(
      { _id: req.params.id, user: req.user.id }
    ).populate('doctor', 'name specialization email phone');

    console.log('Delete result:', deletedAppointment ? 'Success' : 'NotFound/NoMatch');

    if (!deletedAppointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully',
      data: {
        appointment: deletedAppointment
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
    const doctors = await Doctor.find({ isActive: true })
      .select('name specialization email phone availableDays availableTimeSlots')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: {
        doctors,
        count: doctors.length
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
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or not available'
      });
    }

    // Parse date and get day of week in English
    const appointmentDate = new Date(date);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[appointmentDate.getDay()];

    // Check if doctor is available on this day
    if (!doctor.availableDays.includes(dayOfWeek)) {
      return res.status(400).json({
        success: false,
        message: `Doctor is not available on ${dayOfWeek}`
      });
    }

    // Get all booked slots for this doctor on this date
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      date: new Date(date),
      status: { $in: ['confirmed', 'pending'] }
    });

    const bookedTimes = bookedAppointments.map(apt => apt.time);

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
