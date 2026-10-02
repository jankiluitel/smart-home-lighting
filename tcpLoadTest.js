const net = require('net');

const HOST = '127.0.0.1';
const PORT = 6000;
const workloads = [10, 100, 500, 1000];

function generateRoomData(roomNumber) {
    return {
        sensorId: `load-sensor-${roomNumber}`,
        roomId: `load-room-${roomNumber}`,
        timestamp: new Date().toISOString(),
        motionDetected: Math.random() > 0.5,
        lightIntensity: Math.floor(Math.random() * 1000),
        occupancy: Math.floor(Math.random() * 5)
    };
}

function testWorkload(numberOfRooms) {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        const start = process.hrtime.bigint();

        client.connect(PORT, HOST, () => {
            for (let i = 1; i <= numberOfRooms; i++) {
                client.write(
                    JSON.stringify(generateRoomData(i)) + '\n'
                );
            }

            client.end();
        });

        client.on('close', () => {
            const end = process.hrtime.bigint();
            const durationMs =
                Number(end - start) / 1_000_000;

            resolve({
                rooms: numberOfRooms,
                totalTimeMs: durationMs.toFixed(3),
                avgTimePerRoomMs:
                    (durationMs / numberOfRooms).toFixed(4),
                throughputRoomsPerSecond:
                    (numberOfRooms / (durationMs / 1000)).toFixed(2)
            });
        });

        client.on('error', reject);
    });
}

async function runTests() {
    console.log(
        '\nSMART HOME LIGHTING - TCP SCALABILITY TEST\n'
    );

    const results = [];

    for (const workload of workloads) {
        const result = await testWorkload(workload);
        results.push(result);

        console.log(
            `${workload} rooms completed in ${result.totalTimeMs} ms`
        );
    }

    console.log('\nSUMMARY');
    console.table(results);
}

runTests();