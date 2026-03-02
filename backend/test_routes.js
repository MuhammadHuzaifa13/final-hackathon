const axios = require('axios');

async function testRoutes() {
    console.log('Testing Backend Endpoints...');
    try {
        // Test Health
        const health = await axios.get('http://localhost:5000/health');
        console.log('Health:', health.data);

        // Test Signup (Preflight simulation isn't easy with axios, but we can check headers)
        try {
            await axios.post('http://localhost:5000/api/auth/signup', {}, {
                headers: { 'Origin': 'http://localhost:8085' }
            });
        } catch (err) {
            console.log('Signup Status (expected error if body empty):', err.response?.status);
            console.log('CORS Headers:', {
                'access-control-allow-origin': err.response?.headers['access-control-allow-origin'],
                'access-control-allow-credentials': err.response?.headers['access-control-allow-credentials']
            });
        }
    } catch (error) {
        console.error('Test Failed:', error.message);
    }
}

testRoutes();
