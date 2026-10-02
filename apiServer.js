const express = require('express');
const connectDatabase = require('./database');
const LightingRecord = require('./models/lightingRecord');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Home route
app.get('/', (req, res) => {
    res.json({
        message: 'Smart Home Lighting API is running'
    });
});

// GET all lighting records
app.get('/lightingRecords', async (req, res) => {
    try {
        const records = await LightingRecord.find();

        res.status(200).json(records);
    } catch (error) {
        console.error('Error retrieving records:', error.message);

        res.status(500).json({
            error: 'Failed to retrieve lighting records'
        });
    }
});

// GET one lighting record by MongoDB ID
app.get('/lightingRecords/:id', async (req, res) => {
    try {
        const record = await LightingRecord.findById(req.params.id);

        if (!record) {
            return res.status(404).json({
                error: 'Lighting record not found'
            });
        }

        res.status(200).json(record);
    } catch (error) {
        console.error('Error retrieving record:', error.message);

        res.status(500).json({
            error: 'Failed to retrieve lighting record'
        });
    }
});

// Start application
async function startServer() {
    try {
        console.log('Connecting to MongoDB...');

        await connectDatabase();

        app.listen(PORT, '0.0.0.0', () => {
            console.log('==========================================');
            console.log(' SMART HOME LIGHTING REST API');
            console.log('==========================================');
            console.log(`Server running on port ${PORT}`);
            console.log('GET /');
            console.log('GET /lightingRecords');
            console.log('GET /lightingRecords/:id');
        });

    } catch (error) {
        console.error('Failed to start API server:');
        console.error(error);
        process.exit(1);
    }
}

startServer();