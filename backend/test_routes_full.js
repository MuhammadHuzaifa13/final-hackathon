const axios = require('axios');

async function testRoutes() {
    console.log('--- STARTING COMPREHENSIVE BACKEND TEST ---');
    try {
        const origin = 'http://localhost:8085';

        // 1. Test OPTIONS (Preflight)
        console.log('1. Testing OPTIONS /api/auth/signup...');
        const optionsRes = await axios.options('http://localhost:5000/api/auth/signup', {
            headers: { 'Origin': origin, 'Access-Control-Request-Method': 'POST' }
        });
        console.log('OPTIONS Status:', optionsRes.status);
        console.log('OPTIONS CORS Headers:', optionsRes.headers);

        // 2. Test POST /api/auth/signup (Expect 400 or 500)
        console.log('\n2. Testing POST /api/auth/signup...');
        try {
            await axios.post('http://localhost:5000/api/auth/signup',
                {
                    name: 'Pro Success',
                    email: `pro_${Date.now()}@test.com`,
                    password: 'password123'
                },
                { headers: { 'Origin': origin } }
            );
            console.log('Signup POST: SUCCESS');
        } catch (err) {
            console.log('POST Status:', err.response?.status);
            console.log('POST Data:', err.response?.data);
        }

    } catch (error) {
        console.error('CRITICAL TEST ERROR:', error.message);
        if (error.response) {
            console.log('Error Headers:', error.response.headers);
        }
    }
}

testRoutes();
