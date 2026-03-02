const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testBackend() {
    console.log('--- TESTING BACKEND MIGRATION ---');

    try {
        // 1. Health check
        console.log('1. Checking Health...');
        const health = await axios.get('http://localhost:5000/health');
        console.log('Health Status:', health.data.status);

        // 2. Signup
        console.log('2. Testing Signup...');
        const signupData = {
            name: 'Atlas Test User',
            email: `test_${Date.now()}@atlas.com`,
            password: 'password123',
            phone: '123456789'
        };
        const signup = await axios.post(`${API_URL}/auth/signup`, signupData);
        console.log('Signup Success:', signup.data.success);
        const token = signup.data.data.token;

        // 3. Login
        console.log('3. Testing Login...');
        const login = await axios.post(`${API_URL}/auth/login`, {
            email: signupData.email,
            password: signupData.password
        });
        console.log('Login Success:', login.data.success);

        // 4. Get Doctors
        console.log('4. Testing Get Doctors...');
        const doctors = await axios.get(`${API_URL}/appointments/doctors`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Doctors Found:', doctors.data.data.count);
        const docId = doctors.data.data.doctors[0]._id;

        // 5. Book Appointment
        console.log('5. Testing Book Appointment...');
        // Tomorrow's date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];

        const book = await axios.post(`${API_URL}/appointments/book`, {
            doctorId: docId,
            date: dateStr,
            time: '10:00',
            reason: 'Regular Checkup'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Booking Success:', book.data.success);

        // 6. Get Records
        console.log('6. Testing Records...');
        const records = await axios.get(`${API_URL}/records`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Records Found:', records.data.data.records.length);

        console.log('\n--- ALL BACKEND TESTS PASSED ---');
    } catch (error) {
        console.error('--- TEST FAILED ---');
        console.error(error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

testBackend();
