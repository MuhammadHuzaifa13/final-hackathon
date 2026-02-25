const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const db = require('./utils/db');

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const userRoutes = require('./routes/user');
const recordRoutes = require('./routes/records');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/records', recordRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Wait for DB initialization
    await db.init();

    // Seed doctors if empty
    const doctors = await db.read('doctors');
    if (doctors.length === 0) {
      const initialDoctors = [
        {
          _id: 'doc1',
          name: 'Dr. Sarah Wilson',
          specialization: 'Cardiologist',
          email: 'sarah.wilson@medicare.com',
          phone: '123-456-7890',
          availableDays: ['Monday', 'Wednesday', 'Friday'],
          availableTimeSlots: [{ start: '09:00', end: '17:00' }],
          isActive: true
        },
        {
          _id: 'doc2',
          name: 'Dr. James Miller',
          specialization: 'Dermatologist',
          email: 'james.miller@medicare.com',
          phone: '123-456-7891',
          availableDays: ['Tuesday', 'Thursday'],
          availableTimeSlots: [{ start: '10:00', end: '16:00' }],
          isActive: true
        },
        {
          _id: 'doc3',
          name: 'Dr. Emily Chen',
          specialization: 'Pediatrician',
          email: 'emily.chen@medicare.com',
          phone: '123-456-7892',
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          availableTimeSlots: [{ start: '08:00', end: '12:00' }],
          isActive: true
        }
      ];
      await db.write('doctors', initialDoctors);
      console.log('Doctors seeded successfully');
    }

    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    process.on('SIGINT', () => {
      console.log('Shutting down server...');
      server.close(() => {
        console.log('Server process terminated');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
