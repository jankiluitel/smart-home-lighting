const net = require('net');

const PORT = 6000;
const HOST = '127.0.0.1';

const server = net.createServer((socket) => {

    console.log('\n----------------------------------------');
    console.log('New sensor simulator connected');
    console.log(`Client: ${socket.remoteAddress}:${socket.remotePort}`);
    console.log('----------------------------------------');

    let buffer = '';

    socket.on('data', (data) => {

        buffer += data.toString();

        // Each sensor reading is separated by a newline
        const messages = buffer.split('\n');

        // Keep the last incomplete message in the buffer
        buffer = messages.pop();

        messages.forEach((message) => {

            if (message.trim() === '') {
                return;
            }

            try {

                const sensorData = JSON.parse(message);

                console.log('\n========== SENSOR DATA RECEIVED ==========');
                console.log(`Sensor ID:       ${sensorData.sensorId}`);
                console.log(`Room ID:         ${sensorData.roomId}`);
                console.log(`Motion Detected: ${sensorData.motionDetected}`);
                console.log(`Light Intensity: ${sensorData.lightIntensity} lux`);
                console.log(`Occupancy:       ${sensorData.occupancy}`);
                console.log(`Timestamp:       ${sensorData.timestamp}`);

                console.log('==========================================');

            } catch (error) {

                console.log('\nError parsing sensor data:');
                console.log(error.message);
            }
        });
    });

    socket.on('end', () => {
        console.log('\nSensor simulator disconnected.');
    });

    socket.on('error', (error) => {
        console.log('\nSocket error:', error.message);
    });
});

server.on('error', (error) => {
    console.log('Server error:', error.message);
});

server.listen(PORT, HOST, () => {

    console.log('==========================================');
    console.log(' SMART HOME LIGHTING - TCP SERVER');
    console.log('==========================================');
    console.log(`Server listening on ${HOST}:${PORT}`);
    console.log('Waiting for sensor data...');
});