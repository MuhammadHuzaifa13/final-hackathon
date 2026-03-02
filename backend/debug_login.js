const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const UserSchema = new mongoose.Schema({
    email: String,
    password: { type: String, select: true }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function debugLogin(email, password) {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            console.log(`User not found: ${email}`);
            process.exit(0);
        }

        console.log(`User found: ${user.email}`);
        console.log(`Hashed password in DB: ${user.password}`);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`Password match result: ${isMatch}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
    console.log('Usage: node debug_login.js <email> <password>');
    process.exit(1);
}

debugLogin(email, password);
