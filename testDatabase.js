const connectDatabase = require('./database');
const LightingRecord = require('./models/lightingRecord');

async function testDatabase() {

    await connectDatabase();

    const record = new LightingRecord({
        sensorId: 'sensor-1',
        roomId: 'room-1',
        motionDetected: true,
        lightIntensity: 120,
        occupancy: 2,
        lightStatus: 'ON',
        brightness: 100,
        reason: 'Room occupied and ambient light is low'
    });

    await record.save();

    console.log('\nLighting record saved successfully.');
    console.log(record);

    process.exit();
}

testDatabase();