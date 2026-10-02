const fs = require("fs");

const csv = fs
  .readFileSync("hd-results.csv", "utf8")
  .trim()
  .split("\n");

const rows = csv
  .slice(1)
  .map(line => {

    const values =
      line.split(",");

    return {
      architecture:
        values[0],

      rooms:
        Number(values[1]),

      messages:
        Number(values[2]),

      reduction:
        Number(values[3])
    };
  });


const workloads = [
  100,
  500,
  1000,
  5000,
  10000
];


const baseline =
  rows.filter(
    row =>
      row.architecture ===
      "Baseline"
  );


const edge =
  rows.filter(
    row =>
      row.architecture ===
      "Edge"
  );


const width = 1100;
const height = 700;

const chartLeft = 110;
const chartTop = 150;

const chartWidth = 880;
const chartHeight = 430;

const maxValue = 10000;


let svg = `
<svg xmlns="http://www.w3.org/2000/svg"
     width="${width}"
     height="${height}"
     viewBox="0 0 ${width} ${height}">

<rect width="100%"
      height="100%"
      fill="white"/>

<text x="550"
      y="50"
      text-anchor="middle"
      font-family="Arial"
      font-size="28"
      font-weight="bold">
Baseline vs Edge Downstream Message Volume
</text>

<text x="550"
      y="82"
      text-anchor="middle"
      font-family="Arial"
      font-size="17">
Smart Home IoT Scalability Experiment
</text>


<!-- Legend -->

<rect x="405"
      y="105"
      width="22"
      height="22"
      fill="#4472C4"/>

<text x="437"
      y="122"
      font-family="Arial"
      font-size="16">
Baseline
</text>

<rect x="555"
      y="105"
      width="22"
      height="22"
      fill="#70AD47"/>

<text x="587"
      y="122"
      font-family="Arial"
      font-size="16">
Edge Aggregation
</text>


<!-- Axes -->

<line x1="${chartLeft}"
      y1="${chartTop}"
      x2="${chartLeft}"
      y2="${chartTop + chartHeight}"
      stroke="black"
      stroke-width="2"/>

<line x1="${chartLeft}"
      y1="${chartTop + chartHeight}"
      x2="${chartLeft + chartWidth}"
      y2="${chartTop + chartHeight}"
      stroke="black"
      stroke-width="2"/>
`;


/* Y axis */

for (
  let tick = 0;
  tick <= 10000;
  tick += 2000
) {

  const y =
    chartTop +
    chartHeight -
    (
      tick /
      maxValue
    ) *
    chartHeight;


  svg += `
  <line
    x1="${chartLeft}"
    y1="${y}"
    x2="${chartLeft + chartWidth}"
    y2="${y}"
    stroke="#DDDDDD"
    stroke-width="1"
  />

  <text
    x="${chartLeft - 15}"
    y="${y + 5}"
    text-anchor="end"
    font-family="Arial"
    font-size="15">
    ${tick}
  </text>
  `;
}


/* Bars */

workloads.forEach(
  (workload, index) => {

    const groupX =
      chartLeft +
      80 +
      index * 165;


    const baselineResult =
      baseline.find(
        row =>
          row.rooms ===
          workload
      );


    const edgeResult =
      edge.find(
        row =>
          row.rooms ===
          workload
      );


    const baselineHeight =
      (
        baselineResult.messages /
        maxValue
      ) *
      chartHeight;


    const edgeHeight =
      (
        edgeResult.messages /
        maxValue
      ) *
      chartHeight;


    svg += `

    <!-- Baseline -->

    <rect
      x="${groupX}"
      y="${
        chartTop +
        chartHeight -
        baselineHeight
      }"
      width="48"
      height="${baselineHeight}"
      fill="#4472C4"
    />


    <!-- Edge -->

    <rect
      x="${groupX + 55}"
      y="${
        chartTop +
        chartHeight -
        edgeHeight
      }"
      width="48"
      height="${edgeHeight}"
      fill="#70AD47"
    />


    <!-- Workload label -->

    <text
      x="${groupX + 51}"
      y="${chartTop + chartHeight + 30}"
      text-anchor="middle"
      font-family="Arial"
      font-size="15">
      ${workload}
    </text>
    `;
  }
);


/* Axis titles */

svg += `

<text
  x="550"
  y="650"
  text-anchor="middle"
  font-family="Arial"
  font-size="18"
  font-weight="bold">
  Simulated IoT Rooms
</text>


<text
  transform="translate(30 365) rotate(-90)"
  text-anchor="middle"
  font-family="Arial"
  font-size="18"
  font-weight="bold">
  Downstream Messages
</text>


<text
  x="550"
  y="685"
  text-anchor="middle"
  font-family="Arial"
  font-size="14">
  Edge aggregation batch size = 10 readings
</text>

</svg>
`;


fs.writeFileSync(
  "baseline-vs-edge-clean.svg",
  svg
);


console.log(
  "Clean research chart created: baseline-vs-edge-clean.svg"
);