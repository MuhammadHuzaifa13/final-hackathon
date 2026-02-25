# Medical Appointment & Records Management System - Backend

This is the backend API for the Medical Appointment & Records Management System built with Node.js, Express, and MongoDB.

## Features

- **Authentication**: User registration and login with JWT tokens
- **Appointment Management**: Book, view, cancel appointments with clash detection
- **User Profile**: View and update user information
- **Medical Records**: Manage personal medical records
- **Doctor Management**: Available doctors and time slots
- **Security**: Password hashing, JWT authentication, rate limiting

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/medical_appointments
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

4. Make sure MongoDB is running on your system

5. Seed the database with sample doctors:
   ```bash
   node seedDoctors.js
   ```

6. Start the server:
   ```bash
   npm run dev
   ```
   For production:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Appointments
- `POST /api/appointments/book` - Book a new appointment (protected)
- `GET /api/appointments/upcoming` - Get upcoming appointments (protected)
- `GET /api/appointments/history` - Get appointment history (protected)
- `PUT /api/appointments/:id/cancel` - Cancel appointment (protected)
- `GET /api/appointments/doctors` - Get available doctors (protected)
- `GET /api/appointments/available-slots/:doctorId/:date` - Get available time slots (protected)

### User Profile
- `GET /api/user/profile` - Get user profile (protected)
- `PUT /api/user/update` - Update user profile (protected)
- `PUT /api/user/change-password` - Change password (protected)
- `DELETE /api/user/delete` - Delete account (protected)

### Medical Records
- `GET /api/records` - Get all medical records (protected)
- `GET /api/records/stats` - Get record statistics (protected)
- `GET /api/records/:id` - Get single medical record (protected)
- `POST /api/records` - Create medical record (protected)
- `PUT /api/records/:id` - Update medical record (protected)
- `DELETE /api/records/:id` - Delete medical record (protected)

### Health Check
- `GET /health` - Server health check

## Database Schema

### User
- name (String, required)
- email (String, required, unique)
- password (String, required)
- phone (String, optional)
- address (String, optional)

### Doctor
- name (String, required)
- specialization (String, required)
- email (String, required, unique)
- phone (String, required)
- availableDays (Array of Strings)
- availableTimeSlots (Array of Objects)
- isActive (Boolean)

### Appointment
- user (ObjectId, ref: User)
- doctor (ObjectId, ref: Doctor)
- date (Date, required)
- time (String, required)
- status (Enum: pending, confirmed, cancelled, completed)
- notes (String, optional)

### MedicalRecord
- user (ObjectId, ref: User)
- title (String, required)
- description (String, required)
- recordType (Enum: lab_result, prescription, diagnosis, imaging, vaccination, other)
- fileUrl (String, optional)
- fileName (String, optional)
- fileSize (Number, optional)

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Rate limiting (100 requests per 15 minutes)
- Security headers with Helmet
- Input validation and sanitization
- CORS configuration

## Error Handling

- Global error handling middleware
- Consistent error response format
- Development vs production error messages
- 404 handler for unknown routes

## Testing

The API includes comprehensive error handling and validation. You can test the endpoints using tools like Postman or curl.

## Deployment

1. Set `NODE_ENV=production`
2. Update `MONGODB_URI` to your production database
3. Use a strong `JWT_SECRET`
4. Ensure proper CORS configuration
5. Consider using a reverse proxy like Nginx

## License

This project is licensed under the ISC License.
