const net = require("net");

const HOST = "127.0.0.1";

const EDGE_PORT = 7000;
const DOWNSTREAM_PORT = 7100;

const BATCH_SIZE = 10;

let sensorBuffer = [];

let receivedMessages = 0;
let forwardedBatches = 0;

let downstreamClient = null;


/*
 * Aggregate multiple raw IoT sensor readings
 * into one edge-level summary.
 */
function aggregateBatch(batch) {

  const occupiedRooms = batch.filter(
    (reading) => reading.occupancy > 0
  ).length;

  const motionEvents = batch.filter(
    (reading) =>
      reading.motionDetected === true
  ).length;

  const averageLightIntensity =
    batch.reduce(
      (sum, reading) =>
        sum + reading.lightIntensity,
      0
    ) / batch.length;

  return {

    timestamp:
      new Date().toISOString(),

    readingsAggregated:
      batch.length,

    occupiedRooms,

    motionEvents,

    averageLightIntensity:
      Number(
        averageLightIntensity.toFixed(2)
      )
  };
}


/*
 * Forward one aggregated message
 * to the downstream processing service.
 */
function forwardToDownstream(
  aggregatedData
) {

  if (
    downstreamClient &&
    !downstreamClient.destroyed
  ) {

    downstreamClient.write(
      JSON.stringify(
        aggregatedData
      ) + "\n"
    );

    forwardedBatches++;
  }
}


/*
 * Process each raw sensor reading.
 */
function processReading(reading) {

  receivedMessages++;

  sensorBuffer.push(reading);

  if (
    sensorBuffer.length >=
    BATCH_SIZE
  ) {

    const batch =
      sensorBuffer.splice(
        0,
        BATCH_SIZE
      );

    const aggregatedData =
      aggregateBatch(batch);

    forwardToDownstream(
      aggregatedData
    );

    const reduction =
      (
        (
          receivedMessages -
          forwardedBatches
        ) /
        receivedMessages
      ) * 100;

    console.log(
      "\n--- EDGE AGGREGATED BATCH ---"
    );

    console.log(
      aggregatedData
    );

    console.log(
      `Received: ${receivedMessages} | ` +
      `Forwarded: ${forwardedBatches} | ` +
      `Message reduction: ${reduction.toFixed(2)}%`
    );
  }
}


/*
 * Connect Edge Gateway to the
 * downstream service.
 */
function connectDownstream() {

  downstreamClient =
    net.createConnection(
      {
        host: HOST,
        port: DOWNSTREAM_PORT
      },
      () => {

        console.log(
          `Connected to downstream service at ${HOST}:${DOWNSTREAM_PORT}`
        );

        startEdgeServer();
      }
    );

  downstreamClient.on(
    "error",
    (error) => {

      console.error(
        "Downstream connection error:",
        error.message
      );
    }
  );
}


/*
 * Start the IoT-facing edge server.
 */
function startEdgeServer() {

  const server =
    net.createServer(
      (socket) => {

        console.log(
          "\nIoT sensor connection established."
        );

        let buffer = "";

        socket.on(
          "data",
          (data) => {

            buffer +=
              data.toString();

            const messages =
              buffer.split("\n");

            buffer =
              messages.pop();

            for (
              const message
              of messages
            ) {

              if (
                !message.trim()
              ) continue;

              try {

                const reading =
                  JSON.parse(
                    message
                  );

                processReading(
                  reading
                );

              } catch (error) {

                console.error(
                  "Invalid sensor message:",
                  error.message
                );
              }
            }
          }
        );

        socket.on(
          "end",
          () => {

            console.log(
              "\nIoT sensor connection closed."
            );

            console.log(
              "======================================"
            );

            console.log(
              " EDGE GATEWAY SUMMARY"
            );

            console.log(
              "======================================"
            );

            console.log(
              `Raw messages received: ${receivedMessages}`
            );

            console.log(
              `Aggregated messages forwarded: ${forwardedBatches}`
            );

            const finalReduction =
              (
                (
                  receivedMessages -
                  forwardedBatches
                ) /
                receivedMessages
              ) * 100;

            console.log(
              `Final message reduction: ${finalReduction.toFixed(2)}%`
            );
          }
        );
      }
    );


  server.listen(
    EDGE_PORT,
    HOST,
    () => {

      console.log(
        "======================================"
      );

      console.log(
        " SMART HOME EDGE GATEWAY"
      );

      console.log(
        "======================================"
      );

      console.log(
        `Listening for sensors on ${HOST}:${EDGE_PORT}`
      );

      console.log(
        `Aggregation batch size: ${BATCH_SIZE}`
      );

      console.log(
        "Waiting for IoT sensor data..."
      );
    }
  );
}


connectDownstream();