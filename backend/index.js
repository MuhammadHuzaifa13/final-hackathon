const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const userRoutes = require('./routes/user');
const recordRoutes = require('./routes/records');
const symptomRoutes = require('./routes/symptomRoutes');
const medicationRoutes = require('./routes/medicationRoutes');
const vitalsRoutes = require('./routes/vitalsRoutes');
const messageRoutes = require('./routes/messageRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

console.log('--- STARTING CLEAN BACKEND INSTANCE ---');

// 1. CORS - MUST BE FIRST
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 2. Security
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// 3. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  validate: { trustProxy: false } // Disable IP validation for serverless
});
if (!process.env.NETLIFY) {
  app.use(limiter);
}

// 4. Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('GLOBAL ERROR:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
const PORT = process.env.PORT || 5000;

let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('MongoDB Connected Successfully');

    // Seed doctors if empty
    const doctorsCount = await Doctor.countDocuments();
    if (doctorsCount === 0) {
      const initialDoctors = [
        // ... (existing doctors list)
        {
          name: 'Dr. Sarah Wilson',
          specialization: 'Cardiologist',
          email: 'sarah.wilson@medicare.com',
          phone: '123-456-7890',
          availableDays: ['Monday', 'Wednesday', 'Friday'],
          availableTimeSlots: [{ start: '09:00', end: '17:00' }],
          isActive: true
        },
        {
          name: 'Dr. James Miller',
          specialization: 'Dermatologist',
          email: 'james.miller@medicare.com',
          phone: '123-456-7891',
          availableDays: ['Tuesday', 'Thursday'],
          availableTimeSlots: [{ start: '10:00', end: '16:00' }],
          isActive: true
        },
        {
          name: 'Dr. Emily Chen',
          specialization: 'Pediatrician',
          email: 'emily.chen@medicare.com',
          phone: '123-456-7892',
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          availableTimeSlots: [{ start: '08:00', end: '12:00' }],
          isActive: true
        },
        {
          name: 'Dr. Michael Brown',
          specialization: 'Neurologist',
          email: 'michael.brown@medicare.com',
          phone: '123-456-7893',
          availableDays: ['Monday', 'Thursday'],
          availableTimeSlots: [{ start: '09:00', end: '15:00' }],
          isActive: true
        },
        {
          name: 'Dr. Lisa Davis',
          specialization: 'Gynecologist',
          email: 'lisa.davis@medicare.com',
          phone: '123-456-7894',
          availableDays: ['Wednesday', 'Friday', 'Saturday'],
          availableTimeSlots: [{ start: '10:00', end: '18:00' }],
          isActive: true
        },
        {
          name: 'Dr. Robert Garcia',
          specialization: 'Orthopedic',
          email: 'robert.garcia@medicare.com',
          phone: '123-456-7895',
          availableDays: ['Monday', 'Tuesday', 'Friday'],
          availableTimeSlots: [{ start: '08:30', end: '16:30' }],
          isActive: true
        },
        {
          name: 'Dr. Jennifer Kim',
          specialization: 'Ophthalmologist',
          email: 'jennifer.kim@medicare.com',
          phone: '123-456-7896',
          availableDays: ['Tuesday', 'Wednesday', 'Thursday'],
          availableTimeSlots: [{ start: '09:30', end: '17:30' }],
          isActive: true
        },
        {
          name: 'Dr. William Taylor',
          specialization: 'Oncologist',
          email: 'william.taylor@medicare.com',
          phone: '123-456-7897',
          availableDays: ['Thursday', 'Friday'],
          availableTimeSlots: [{ start: '11:00', end: '19:00' }],
          isActive: true
        }
      ];
      await Doctor.insertMany(initialDoctors);
      console.log('Doctors seeded successfully');
    }
  } catch (error) {
    console.error('Failed to connect to DB:', error);
  }
};

// Middleware to ensure DB connection for serverless
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

if (process.env.NODE_ENV !== 'production' || !process.env.NETLIFY) {
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

module.exports = app;
module.exports.handler = require('serverless-http')(app);
