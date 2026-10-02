const mongoose = require('mongoose');
require('dotenv').config();

async function connectDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('==========================================');
        console.log(' MONGODB CONNECTION SUCCESSFUL');
        console.log('==========================================');
        console.log('Connected to smart_home_lighting database');

    } catch (error) {
        console.error('MongoDB connection failed:');
        console.error(error.message);
        process.exit(1);
    }
}

module.exports = connectDatabase;