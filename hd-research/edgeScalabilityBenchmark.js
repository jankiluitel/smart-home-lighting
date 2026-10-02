const { performance } = require("perf_hooks");
const fs = require("fs");

const WORKLOADS = [
  100,
  500,
  1000,
  5000,
  10000
];

const BATCH_SIZE = 10;


function generateReading(id) {
  return {
    sensorId: `HD-SENSOR-${id}`,
    roomId: `ROOM-${id}`,
    timestamp: new Date().toISOString(),

    motionDetected:
      Math.random() > 0.5,

    lightIntensity:
      Math.floor(Math.random() * 1000),

    occupancy:
      Math.floor(Math.random() * 5)
  };
}


function aggregateBatch(batch) {

  const occupiedRooms =
    batch.filter(
      reading =>
        reading.occupancy > 0
    ).length;

  const motionEvents =
    batch.filter(
      reading =>
        reading.motionDetected
    ).length;

  const averageLightIntensity =
    batch.reduce(
      (sum, reading) =>
        sum +
        reading.lightIntensity,
      0
    ) / batch.length;

  return {
    readingsAggregated:
      batch.length,

    occupiedRooms,

    motionEvents,

    averageLightIntensity
  };
}


function runBaseline(workload) {

  const memoryBefore =
    process.memoryUsage().heapUsed;

  const start =
    performance.now();

  let downstreamMessages = 0;
  let failed = 0;

  for (
    let i = 1;
    i <= workload;
    i++
  ) {

    try {

      const reading =
        generateReading(i);

      JSON.stringify(reading);

      downstreamMessages++;

    } catch (error) {

      failed++;
    }
  }

  const end =
    performance.now();

  const memoryAfter =
    process.memoryUsage().heapUsed;

  const totalTime =
    end - start;

  return {

    workload,

    downstreamMessages,

    reduction: 0,

    totalTime,

    throughput:
      workload /
      (totalTime / 1000),

    memoryMB:
      (memoryAfter -
       memoryBefore) /
      1024 /
      1024,

    failed
  };
}


function runEdge(workload) {

  const memoryBefore =
    process.memoryUsage().heapUsed;

  const start =
    performance.now();

  let buffer = [];

  let downstreamMessages = 0;
  let failed = 0;

  for (
    let i = 1;
    i <= workload;
    i++
  ) {

    try {

      const reading =
        generateReading(i);

      buffer.push(reading);

      if (
        buffer.length ===
        BATCH_SIZE
      ) {

        const aggregated =
          aggregateBatch(buffer);

        JSON.stringify(
          aggregated
        );

        downstreamMessages++;

        buffer = [];
      }

    } catch (error) {

      failed++;
    }
  }


  /*
   * Forward any remaining readings
   * that do not form a complete batch.
   */
  if (
    buffer.length > 0
  ) {

    const aggregated =
      aggregateBatch(buffer);

    JSON.stringify(
      aggregated
    );

    downstreamMessages++;
  }


  const end =
    performance.now();

  const memoryAfter =
    process.memoryUsage().heapUsed;

  const totalTime =
    end - start;


  const reduction =
    (
      (
        workload -
        downstreamMessages
      ) /
      workload
    ) * 100;


  return {

    workload,

    downstreamMessages,

    reduction,

    totalTime,

    throughput:
      workload /
      (totalTime / 1000),

    memoryMB:
      (memoryAfter -
       memoryBefore) /
      1024 /
      1024,

    failed
  };
}


function formatResult(
  architecture,
  result
) {

  return {

    Architecture:
      architecture,

    Rooms:
      result.workload,

    "Downstream Messages":
      result.downstreamMessages,

    "Reduction (%)":
      result.reduction.toFixed(2),

    "Time (ms)":
      result.totalTime.toFixed(3),

    "Throughput (readings/s)":
      result.throughput.toFixed(2),

    "Memory Δ (MB)":
      result.memoryMB.toFixed(3),

    Failed:
      result.failed
  };
}


console.log(
  "=============================================="
);

console.log(
  " SMART HOME IoT SCALABILITY RESEARCH"
);

console.log(
  " BASELINE vs EDGE AGGREGATION"
);

console.log(
  "=============================================="
);

console.log(
  `Aggregation batch size: ${BATCH_SIZE}`
);

console.log(
  `Workloads: ${WORKLOADS.join(", ")}`
);


const results = [];


for (
  const workload
  of WORKLOADS
) {

  console.log(
    `\nTesting ${workload} simulated rooms...`
  );


  const baseline =
    runBaseline(workload);

  const edge =
    runEdge(workload);


  results.push(
    formatResult(
      "Baseline",
      baseline
    )
  );

  results.push(
    formatResult(
      "Edge",
      edge
    )
  );
}


console.log(
  "\n=============================================="
);

console.log(
  " EXPERIMENTAL RESULTS"
);

console.log(
  "==============================================\n"
);


console.table(results);


console.log(
  "\n=============================================="
);

console.log(
  " RESEARCH SUMMARY"
);

console.log(
  "=============================================="
);


for (
  const workload
  of WORKLOADS
) {

  const edge =
    results.find(
      result =>
        result.Architecture ===
          "Edge" &&
        result.Rooms ===
          workload
    );

  console.log(
    `${workload} rooms: ` +
    `${edge["Downstream Messages"]} downstream messages, ` +
    `${edge["Reduction (%)"]}% message reduction`
  );
}
// Save exact experimental results for analysis.
fs.writeFileSync(
  "hd-results.json",
  JSON.stringify(results, null, 2)
);

const csvHeaders = [
  "Architecture",
  "Rooms",
  "Downstream Messages",
  "Reduction (%)",
  "Time (ms)",
  "Throughput (readings/s)",
  "Memory Δ (MB)",
  "Failed"
];

const csvRows = results.map(
  result =>
    csvHeaders
      .map(header => result[header])
      .join(",")
);

const csvContent =
  csvHeaders.join(",") +
  "\n" +
  csvRows.join("\n");

fs.writeFileSync(
  "hd-results.csv",
  csvContent
);

console.log(
  "\nResults saved to hd-results.json and hd-results.csv"
);

console.log(
  "\nExperiment completed."
);