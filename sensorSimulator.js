const net = require('net');
const determineLighting = require('./services/lightingController');

const HOST = '127.0.0.1';
const PORT = 6000;

const NUMBER_OF_ROOMS = 10;

// Generate simulated sensor data for a room
function generateRoomData(roomNumber) {

    const motionDetected = Math.random() > 0.5;
    const lightIntensity = Math.floor(Math.random() * 1000);
    const occupancy = Math.floor(Math.random() * 5);

    return {
        sensorId: `sensor-${roomNumber}`,
        roomId: `room-${roomNumber}`,
        timestamp: new Date().toISOString(),
        motionDetected: motionDetected,
        lightIntensity: lightIntensity,
        occupancy: occupancy
    };
}

// Create TCP client
const client = new net.Socket();

client.connect(PORT, HOST, () => {

    console.log('==========================================');
    console.log(' SMART HOME LIGHTING SENSOR SIMULATOR');
    console.log('==========================================');
    console.log(`Connected to TCP Server at ${HOST}:${PORT}`);
    console.log(`Simulating ${NUMBER_OF_ROOMS} rooms...`);

    for (let i = 1; i <= NUMBER_OF_ROOMS; i++) {

        // Generate sensor data
        const sensorData = generateRoomData(i);

        // Determine lighting action
        const lightingDecision = determineLighting(sensorData);

        console.log('\n------------------------------------------');
        console.log(`ROOM ${i}`);
        console.log('------------------------------------------');

        console.log('Sensor Data:');
        console.log(sensorData);

        console.log('\nLighting Decision:');
        console.log(lightingDecision);

        // Send sensor data to TCP server
        const message = JSON.stringify(sensorData);
        client.write(message + '\n');
    }

    setTimeout(() => {

        console.log('\nAll sensor data sent successfully.');
        client.end();

    }, 1000);
});

client.on('error', (error) => {
    console.log('Connection error:', error.message);
});