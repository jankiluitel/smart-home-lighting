const net = require("net");

const HOST = "127.0.0.1";
const PORT = 7100;

let receivedBatches = 0;
let representedReadings = 0;

const server = net.createServer((socket) => {
  console.log("\nEdge Gateway connected.");

  let buffer = "";

  socket.on("data", (data) => {
    buffer += data.toString();

    const messages = buffer.split("\n");
    buffer = messages.pop();

    for (const message of messages) {
      if (!message.trim()) continue;

      try {
        const batch = JSON.parse(message);

        receivedBatches++;

        representedReadings +=
          batch.readingsAggregated;

        console.log("\n--- AGGREGATED DATA RECEIVED ---");

        console.log(
          `Batch: ${receivedBatches}`
        );

        console.log(
          `Readings represented: ${batch.readingsAggregated}`
        );

        console.log(
          `Occupied rooms: ${batch.occupiedRooms}`
        );

        console.log(
          `Motion events: ${batch.motionEvents}`
        );

        console.log(
          `Average light intensity: ${batch.averageLightIntensity}`
        );

        console.log(
          `Total raw readings represented: ${representedReadings}`
        );
      } catch (error) {
        console.error(
          "Invalid aggregated message:",
          error.message
        );
      }
    }
  });

  socket.on("end", () => {
    console.log("\nEdge Gateway disconnected.");

    console.log(
      `Final batches received: ${receivedBatches}`
    );

    console.log(
      `Final raw readings represented: ${representedReadings}`
    );
  });

  socket.on("error", (error) => {
    console.error(
      "Connection error:",
      error.message
    );
  });
});

server.listen(PORT, HOST, () => {
  console.log(
    "======================================"
  );

  console.log(
    " DOWNSTREAM PROCESSING SERVICE"
  );

  console.log(
    "======================================"
  );

  console.log(
    `Listening on ${HOST}:${PORT}`
  );

  console.log(
    "Waiting for aggregated edge data..."
  );
});