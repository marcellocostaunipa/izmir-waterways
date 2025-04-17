/* 
Day 2: Detailed Map and Visual Representation

**Morning Session: Detailed Geographic Representation**

- Drawing complex shapes with beginShape() and endShape()
- Creating a more accurate boundary representation
- Adding visual hierarchy with colors and stroke weights
- Implementing a legend and UI elements

**Afternoon Session: Data Visualization Principles**

- Encoding data attributes visually (size, color, opacity)
- Representing water levels with visual elements
- Creating a consistent visual language
- Adding context with labels and legends

**Hands-on Exercise:**

- Implement the detailed Izmir boundary using vertex points
- Enhance dam visualization to show water levels
- Create a legend explaining the visualization elements
- Add UI elements like title and attribution

*/

let bounds = {
  minLon: 26.35,
  maxLon: 28.56,
  minLat: 37.89,
  maxLat: 39.46,
};

let izsuData;
let izmir;

let maxArea = 25;

function preload() {
  izsuData = loadJSON("data/izsu.json");
  izmir = loadJSON("data/izmir.json");
}

function setup() {
  createCanvas(500, 500);
  textFont("Arial");

  let features = izsuData.features;
  for (let i = 0; i < izsuData.features.length; i++) {
    let feature = izsuData.features[i];
    console.log(feature.properties.currentWaterLevel);
  }
}

function draw() {
  background(240);

  // Draw the Izmir province boundary
  drawIzmirBoundary();

  // Draw the dams with improved visuals
  drawDams();

  // Draw UI elements
  drawUI();
}

function drawIzmirBoundary() {
  fill(255);
  stroke(100);
  strokeWeight(1);

  // Simplified boundary for demonstration
  beginShape();

  // To iterate through izmir.json
  let boundaryPoints = izmir.boundaryPoints;

  for (let i = 0; i < boundaryPoints.length; i++) {
    let point = boundaryPoints[i];
    let pixelCoord = geoToPixel(point[0], point[1]);
    vertex(pixelCoord.x, pixelCoord.y);
  }

  endShape(CLOSE);
}

function drawDams() {
  // Find the maximum and minimum volumes for scaling
  let maxVolume = 0;
  let minVolume = 0;

  for (let i = 0; i < izsuData.features.length; i++) {
    let feature = izsuData.features[i];
    maxVolume = Math.max(maxVolume, feature.properties.maximum.lakeVolume);
    minVolume = Math.min(minVolume, feature.properties.maximum.lakeVolume);
  }

  // Draw each dam as a circle
  for (let i = 0; i < izsuData.features.length; i++) {
    let feature = izsuData.features[i];

    let coords = feature.geometry.coordinates;
    let pixelCoord = geoToPixel(coords[0], coords[1]);

    // Get the current year data (using 2025 as default)
    let currentYearData;
    let timelineEntry = feature.properties.timeline[0];
    currentYearData = timelineEntry.y2025;

    // Calculate circle size based on maximum lake volume
    let maxLakeVolume = feature.properties.maximum.lakeVolume;

    // Scale min and max diameters
    let minDiameter = 10;
    let maxDiameter = 60;

    let diameter;

    diameter = map(
      maxLakeVolume,
      minVolume,
      maxVolume,
      minDiameter,
      maxDiameter
    );

    // Draw dam circle
    stroke(0, 100, 200);
    strokeWeight(2);
    fill(255);
    ellipse(pixelCoord.x, pixelCoord.y, diameter);

    // Draw water level as fill percentage if data is available
    let activeFullnessRate = currentYearData.activeFullnessRate;
    let fillDiameter = map(activeFullnessRate, 0, 100, 0, diameter);
    
    noStroke();
    fill(0, 100, 255, 150);
    ellipse(pixelCoord.x, pixelCoord.y, fillDiameter);

    // Draw dam name
    fill(0);
    textSize(12);
    textAlign(CENTER);
    text(
      feature.properties.name,
      pixelCoord.x,
      pixelCoord.y - diameter / 2 - 5
    );
  }
}

function drawUI() {
  // Draw title and legend
  noStroke();
  fill(0);
  textSize(20);
  textAlign(LEFT);
  text("Izmir Water Resources (DAY 2)", 20, 30);

  // Legend
  textSize(12);

  // Dam symbol
  stroke(0, 100, 200);
  strokeWeight(2);
  fill(255);
  ellipse(30, height - 60, 15);
  fill(0, 100, 255, 150);
  ellipse(30, height - 60, 7.5);

  fill(0);
  noStroke();
  text("Dam", 45, height - 56);

  // Attribution
  textSize(8);
  text("2025 - Waterways Workshop", 20, height - 10);
}
