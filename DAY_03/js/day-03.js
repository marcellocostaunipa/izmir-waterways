/* 

Day 3: Interactivity and Tooltips

**Morning Session: Mouse Interaction in p5.js**

- Detecting mouse position and clicks
- Creating hover effects
- Implementing tooltips
- Handling mouse events

**Afternoon Session: Interactive Data Exploration**

- Creating interactive elements (buttons, sliders)
- Implementing selection states
- Building tooltips and information displays
- Designing for user engagement

**Hands-on Exercise:**

- Add hover effects to highlight dams when the mouse is over them
- Create tooltips that show dam information on hover
- Implement click functionality to select a dam
- Design a simple information panel for the selected dam

*/

let bounds = {
  minLon: 26.35,
  maxLon: 28.56,
  minLat: 37.89,
  maxLat: 39.46,
};

let izsuData;
let izmir;

let features;
let maxVolume = 0;
let minVolume = 0;

// Track which dam is hovered
let hoveredDam = null;


function preload() {
  izsuData = loadJSON("data/izsu.json");
  izmir = loadJSON("data/izmir.json");
}

function setup() {
  createCanvas(500, 500);
  textFont("Arial");
}

function draw() {
  background(240);

  // Draw the Izmir province boundary
  drawIzmirBoundary();

  // Draw the dams with hover effects
  drawDams();

  // Draw UI elements
  drawUI();

  // Draw tooltip for hovered dam
  if (hoveredDam) {
    drawTooltip(hoveredDam);
  }
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
  // Reset hovered dam
//   hoveredDam = null;
 

  // Draw each dam as a circle
  for (let i = 0; i < izsuData.features.length; i++) {
    feature = izsuData.features[i];
    
    maxVolume = Math.max(maxVolume, feature.properties.maximum.lakeVolume);
    minVolume = Math.min(minVolume, feature.properties.maximum.lakeVolume);

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

    let diameter = map(
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

    // Check if mouse is over this dam
    if (dist(mouseX, mouseY, pixelCoord.x, pixelCoord.y) < diameter / 2) {
      // Highlight on hover
      noFill();
      stroke(255, 100, 0);
      strokeWeight(2);
      ellipse(pixelCoord.x, pixelCoord.y, diameter + 5);

      // Show tooltip with volume information
      fill(255);
      stroke(0);
      strokeWeight(1);

      // Position tooltip to avoid going off-screen
      let tooltipX = mouseX + 10;
      let tooltipY = mouseY;
      let tooltipWidth = 185;
      let tooltipHeight = 80;

      // Adjust if too close to right edge
      if (tooltipX + tooltipWidth > width) {
        tooltipX = mouseX - tooltipWidth - 10;
      }

      rect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);

      fill(0);
      noStroke();
      textAlign(LEFT);
      textSize(12);
      text(
        feature.properties.name, 
        tooltipX + 5, 
        tooltipY + 15
      );
      text(
        "Max Volume: " + formatVolume(maxLakeVolume),
        tooltipX + 5,
        tooltipY + 35
      );

      if (currentYearData) {
        text(
          "Current Volume: " + formatVolume(currentYearData.totalWaterVolume),
          tooltipX + 5,
          tooltipY + 55
        );
        text(
          "Fullness: " + currentYearData.activeFullnessRate.toFixed(1) + "%",
          tooltipX + 5,
          tooltipY + 75
        );
      }

      // Set as selected dam if clicked
      if (mouseIsPressed) {
        selectedDam = feature;
      }
    }
  }
}

function drawUI() {
  push();
  // Draw title and legend
  noStroke();
  fill(0);
  textSize(20);
  textAlign(LEFT);
  text("Izmir Water Resources (DAY 3)", 20, 30);

  // Legend
  textSize(12);
  textAlign(LEFT);

  // Dam symbol
  stroke(0, 100, 200);
  strokeWeight(2);
  fill(255);
  ellipse(30, height - 60, 15);
  noStroke();
  fill(0, 100, 255, 150);
  ellipse(30, height - 40, 8.5);

  fill(0);
  noStroke();
  text("Capacity", 45, height - 56);
  text("Active Fullness Rate", 45, height - 36);

  // Attribution
  textSize(8);
  text("2025 - Waterways Workshop", width - 115, height - 10);
  pop();
}
