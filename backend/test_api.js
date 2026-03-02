const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
    console.log('🚀 Starting Backend API Tests...');

    let testUser = {
        name: 'Test User',
        email: `test_${Date.now()}@test.com`,
        password: 'password123',
        phone: '1234567890'
    };

    let token = '';
    let doctorId = '';

    try {
        // 1. Signup
        console.log('\n--- Test 1: Signup ---');
        const signupRes = await axios.post(`${BASE_URL}/auth/signup`, testUser);
        console.log('✅ Signup Success:', signupRes.data.message);

        // 2. Duplicate Signup
        console.log('\n--- Test 2: Duplicate Signup (Should Fail) ---');
        try {
            await axios.post(`${BASE_URL}/auth/signup`, testUser);
            console.log('❌ Error: Duplicate signup should have failed');
        } catch (err) {
            console.log('✅ Duplicate Signup Failed as expected:', err.response.data.message);
        }

        // 3. Login
        console.log('\n--- Test 3: Login ---');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });
        token = loginRes.data.data.token;
        console.log('✅ Login Success. Token received.');

        // 4. Protected Route: Profile
        console.log('\n--- Test 4: Protected Profile Route ---');
        const profileRes = await axios.get(`${BASE_URL}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Profile Access Success:', profileRes.data.data.user.email);

        // 5. Protected Route without Token
        console.log('\n--- Test 5: Profile without Token (Should Fail) ---');
        try {
            await axios.get(`${BASE_URL}/user/profile`);
            console.log('❌ Error: Access without token should have failed');
        } catch (err) {
            console.log('✅ Unauthorized Access Failed as expected:', err.response.status);
        }

        // Pre-test: Get Doctor ID
        console.log('\n--- Pre-test: Fetching Doctors ---');
        const doctorsRes = await axios.get(`${BASE_URL}/appointments/doctors`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const doctor = doctorsRes.data.data.doctors.find(d => d.name.includes('Sarah Wilson'));
        if (!doctor) throw new Error('Could not find Dr. Sarah Wilson');
        doctorId = doctor._id;
        console.log(`✅ Found Doctor: ${doctor.name} (${doctorId})`);

        // 6. Appointment Booking
        console.log('\n--- Test 6: Appointment Booking ---');
        const appointmentData = {
            doctorId: doctorId,
            date: '2026-03-09', // Monday - Sarah is available
            time: '10:00'
        };
        const bookRes = await axios.post(`${BASE_URL}/appointments/book`, appointmentData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Booking Success:', bookRes.data.message);

        // 7. Clash Detection
        console.log('\n--- Test 7: Appointment Clash Detection (Should Fail) ---');
        try {
            await axios.post(`${BASE_URL}/appointments/book`, appointmentData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('❌ Error: Duplicate booking should have failed');
        } catch (err) {
            console.log('✅ Clash Detection Success. Duplicate booking rejected:', err.response.data.message);
        }

        // 8. Upcoming Appointments
        console.log('\n--- Test 8: Upcoming Appointments ---');
        const upcomingRes = await axios.get(`${BASE_URL}/appointments/upcoming`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Upcoming Appointments count:', upcomingRes.data.data.appointments.length);

        console.log('\n✨ All backend tests passed!');
    } catch (err) {
        console.error('\n❌ Test Suite Failed:');
        if (err.response) {
            console.error('Response Error:', err.response.data);
        } else {
            console.error(err.message);
        }
        process.exit(1);
    }
}

runTests();
