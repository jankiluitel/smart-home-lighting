const determineLighting = require('./services/lightingController');

function generateRoomData(roomNumber) {
    return {
        sensorId: `sensor-${roomNumber}`,
        roomId: `room-${roomNumber}`,
        timestamp: new Date().toISOString(),
        motionDetected: Math.random() > 0.5,
        lightIntensity: Math.floor(Math.random() * 1000),
        occupancy: Math.floor(Math.random() * 5)
    };
}

function runScalabilityTest(numberOfRooms) {
    const startMemory = process.memoryUsage().heapUsed;
    const startTime = process.hrtime.bigint();

    let successful = 0;
    let failed = 0;

    for (let i = 1; i <= numberOfRooms; i++) {
        try {
            const sensorData = generateRoomData(i);
            determineLighting(sensorData);
            successful++;
        } catch (error) {
            failed++;
        }
    }

    const endTime = process.hrtime.bigint();
    const endMemory = process.memoryUsage().heapUsed;

    const durationMs =
        Number(endTime - startTime) / 1_000_000;

    const throughput =
        numberOfRooms / (durationMs / 1000);

    const avgLatency =
        durationMs / numberOfRooms;

    const memoryUsedMB =
        (endMemory - startMemory) / 1024 / 1024;

    return {
        rooms: numberOfRooms,
        successful,
        failed,
        totalTimeMs: durationMs.toFixed(3),
        avgLatencyMs: avgLatency.toFixed(6),
        throughputRoomsPerSecond: throughput.toFixed(2),
        memoryChangeMB: memoryUsedMB.toFixed(3)
    };
}

const workloads = [10, 100, 500, 1000];

console.log('\n================================================');
console.log(' SMART HOME LIGHTING - SCALABILITY EXPERIMENT');
console.log('================================================\n');

const results = [];

for (const workload of workloads) {
    const result = runScalabilityTest(workload);
    results.push(result);

    console.log(`Workload: ${workload} rooms`);
    console.log(`Successful: ${result.successful}`);
    console.log(`Failed: ${result.failed}`);
    console.log(`Total Time: ${result.totalTimeMs} ms`);
    console.log(`Average Latency: ${result.avgLatencyMs} ms/room`);
    console.log(
        `Throughput: ${result.throughputRoomsPerSecond} rooms/sec`
    );
    console.log(`Memory Change: ${result.memoryChangeMB} MB`);
    console.log('------------------------------------------------');
}

console.log('\nSUMMARY');
console.table(results);