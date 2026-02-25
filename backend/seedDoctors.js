const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
require('dotenv').config();

const seedDoctors = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medical_appointments');
    console.log('Connected to MongoDB');

    // Clear existing doctors
    await Doctor.deleteMany({});
    console.log('Cleared existing doctors');

    // Sample doctors data
    const doctors = [
      {
        name: 'Dr. Evelyn Reed',
        specialization: 'Cardiologist',
        email: 'evelyn.reed@medical.com',
        phone: '+1 (555) 123-4567',
        availableDays: ['Monday', 'Wednesday', 'Friday'],
        availableTimeSlots: [
          { start: '09:00', end: '12:00' },
          { start: '14:00', end: '17:00' }
        ],
        isActive: true
      },
      {
        name: 'Dr. Marcus Chen',
        specialization: 'General Practitioner',
        email: 'marcus.chen@medical.com',
        phone: '+1 (555) 234-5678',
        availableDays: ['Tuesday', 'Thursday', 'Saturday'],
        availableTimeSlots: [
          { start: '08:00', end: '12:00' },
          { start: '13:00', end: '16:00' }
        ],
        isActive: true
      },
      {
        name: 'Dr. Emily Carter',
        specialization: 'Pediatrician',
        email: 'emily.carter@medical.com',
        phone: '+1 (555) 345-6789',
        availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
        availableTimeSlots: [
          { start: '09:00', end: '12:00' },
          { start: '14:00', end: '18:00' }
        ],
        isActive: true
      },
      {
        name: 'Dr. James Wilson',
        specialization: 'Orthopedic Surgeon',
        email: 'james.wilson@medical.com',
        phone: '+1 (555) 456-7890',
        availableDays: ['Wednesday', 'Friday'],
        availableTimeSlots: [
          { start: '10:00', end: '13:00' },
          { start: '15:00', end: '17:00' }
        ],
        isActive: true
      },
      {
        name: 'Dr. Sarah Martinez',
        specialization: 'Dermatologist',
        email: 'sarah.martinez@medical.com',
        phone: '+1 (555) 567-8901',
        availableDays: ['Monday', 'Wednesday', 'Thursday'],
        availableTimeSlots: [
          { start: '08:30', end: '12:30' },
          { start: '14:30', end: '17:30' }
        ],
        isActive: true
      }
    ];

    // Insert doctors
    await Doctor.insertMany(doctors);
    console.log(`${doctors.length} doctors seeded successfully`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error seeding doctors:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDoctors();
