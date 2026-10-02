const net = require("net");

const HOST = "127.0.0.1";
const PORT = 7000;

const NUMBER_OF_ROOMS = 100;

function generateSensorReading(roomNumber) {
  return {
    sensorId: `HD-SENSOR-${roomNumber}`,
    roomId: `ROOM-${roomNumber}`,
    timestamp: new Date().toISOString(),

    motionDetected: Math.random() > 0.5,

    lightIntensity: Math.floor(
      Math.random() * 1000
    ),

    occupancy: Math.floor(
      Math.random() * 5
    ),
  };
}

const client = net.createConnection(
  {
    host: HOST,
    port: PORT,
  },
  () => {
    console.log(
      "======================================"
    );
    console.log(
      " HD SMART HOME SENSOR SIMULATOR"
    );
    console.log(
      "======================================"
    );

    console.log(
      `Connected to Edge Gateway at ${HOST}:${PORT}`
    );

    console.log(
      `Generating ${NUMBER_OF_ROOMS} room readings...\n`
    );

    for (
      let room = 1;
      room <= NUMBER_OF_ROOMS;
      room++
    ) {
      const reading =
        generateSensorReading(room);

      client.write(
        JSON.stringify(reading) + "\n"
      );
    }

    console.log(
      `${NUMBER_OF_ROOMS} sensor readings transmitted successfully.`
    );

    client.end();
  }
);

client.on("error", (error) => {
  console.error(
    "Sensor simulator error:",
    error.message
  );
});

client.on("end", () => {
  console.log(
    "Connection to Edge Gateway closed."
  );
});