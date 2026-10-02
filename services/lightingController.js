function determineLighting(sensorData) {

    let lightStatus = 'OFF';
    let brightness = 0;
    let reason = '';

    if (!sensorData.motionDetected || sensorData.occupancy === 0) {

        lightStatus = 'OFF';
        brightness = 0;
        reason = 'No occupancy or motion detected';

    } else if (sensorData.lightIntensity < 200) {

        lightStatus = 'ON';
        brightness = 100;
        reason = 'Room occupied and ambient light is low';

    } else if (sensorData.lightIntensity < 500) {

        lightStatus = 'ON';
        brightness = 60;
        reason = 'Moderate ambient light detected';

    } else {

        lightStatus = 'ON';
        brightness = 30;
        reason = 'High ambient light detected';
    }

    if (sensorData.occupancy > 2 && lightStatus === 'ON') {
        brightness = Math.min(100, brightness + 10);
    }

    return {
        roomId: sensorData.roomId,
        lightStatus,
        brightness,
        reason,
        timestamp: new Date().toISOString()
    };
}

module.exports = determineLighting;