const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
    console.log('Testing connection to:', process.env.MONGODB_URI.substring(0, 20) + '...');
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('SUCCESS: Connected to MongoDB Atlas!');
        process.exit(0);
    } catch (err) {
        console.error('FAILURE: Could not connect to MongoDB Atlas');
        console.error(err);
        process.exit(1);
    }
};

testConnection();
