const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Appointment date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Appointment date must be in the future'
    }
  },
  time: {
    type: String,
    required: [true, 'Appointment time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for preventing double bookings
appointmentSchema.index({ user: 1, date: 1, time: 1 }, { unique: true });
appointmentSchema.index({ doctor: 1, date: 1, time: 1 }, { unique: true });

// Update the updatedAt field on save
appointmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to check for appointment clashes
appointmentSchema.statics.checkClash = async function(doctorId, date, time, excludeAppointmentId = null) {
  const query = {
    doctor: doctorId,
    date: new Date(date),
    time: time,
    status: { $in: ['confirmed', 'pending'] }
  };
  
  if (excludeAppointmentId) {
    query._id = { $ne: excludeAppointmentId };
  }
  
  const existingAppointment = await this.findOne(query);
  return existingAppointment;
};

module.exports = mongoose.model('Appointment', appointmentSchema);
