/* 

Day 4: Detailed Information Panel and Final Touches

**Morning Session: Data Visualization Enhancements**

- Creating charts and graphs within p5.js
- Visualizing time-series data
- Animation techniques
- Implementing multiple view modes

**Afternoon Session: Polishing and Extending the Project**

- Refining the user interface
- Adding finishing touches
- Exploring additional features
- Deploying and sharing your visualization

**Hands-on Exercise:**

- Implement a detailed information panel for selected dams
- Create a timeline chart showing historical water levels
- Add animation capabilities to visualize changes over time
- Enhance the project with additional features like comparison views or filtering options

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

// Initially, no dam is being hovered
let hoveredDam = null;
// Track which dam is selected
let selectedDam = null;

let panelWidth;
let panelHeight;
let panelX;
let panelY;

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

  // Draw the dams
  drawDams();

  // Draw UI elements
  drawUI();

  // Draw selected dam details
  if (selectedDam) {
    drawDamDetails(selectedDam);
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
    let feature = izsuData.features[i];
    
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

function drawDamDetails(dam) {
  // Draw detailed information panel for the selected dam
  let panelWidth = 280;
  let panelHeight = 320; // Increased height to accommodate more information
  let panelX = width - panelWidth - 20;
  let panelY = 50;

  push();
  translate(panelX, panelY);

  // Panel background
  fill(255);
  stroke(0);
  strokeWeight(1);
  rect(0, 0, panelWidth, panelHeight);

  // Dam information
  fill(0);
  noStroke();
  textSize(16);
  textAlign(LEFT);
  text(dam.properties.name, 10, 25);

  textSize(12);

  // Display area if available
  if (dam.properties.area) {
    text("Surface Area: " + dam.properties.area + " km²", 10, 50);
  }

  // Get the current year data (2025)
  let currentYearData;
  if (dam.properties.timeline && dam.properties.timeline.length > 0) {
    const timelineEntry = dam.properties.timeline[0];
    currentYearData = timelineEntry.y2025;
  }

  // Display maximum capacity
  let maxVolume;
  if (dam.properties.maximum) {
    maxVolume = dam.properties.maximum.lakeVolume;
  } else {
    maxVolume = 0;
  }
  text("Maximum Capacity: " + formatVolume(maxVolume), 10, 70);

  // Display current water data if available
  let yPos = 90;
  if (currentYearData) {
    text(
      "Current Water Level: " +
        currentYearData.lakeWaterElevation.toFixed(2) +
        " m",
      10,
      yPos
    );
    yPos += 20;

    text(
      "Current Volume: " + formatVolume(currentYearData.totalWaterVolume),
      10,
      yPos
    );
    yPos += 20;

    text(
      "Usable Volume: " + formatVolume(currentYearData.usableWaterVolume),
      10,
      yPos
    );
    yPos += 20;

    text(
      "Fullness Rate: " + currentYearData.activeFullnessRate.toFixed(2) + "%",
      10,
      yPos
    );
    yPos += 30;

    // Draw water level bar
    let barWidth = panelWidth - 20;
    let barHeight = 20;
    let barX = 10;
    let barY = yPos;

    // Bar outline
    noFill();
    stroke(0);
    strokeWeight(1);
    rect(barX, barY, barWidth, barHeight);

    // Fill based on water level
    let fillWidth = (currentYearData.activeFullnessRate / 100) * barWidth;

    // Color coding based on fullness rate
    let fillColor;
    if (currentYearData.activeFullnessRate < 30) {
      fillColor = color(255, 0, 0, 150); // Red for low levels
    } else if (currentYearData.activeFullnessRate < 60) {
      fillColor = color(255, 165, 0, 150); // Orange for medium levels
    } else {
      fillColor = color(0, 100, 255, 150); // Blue for high levels
    }

    fill(fillColor);
    noStroke();
    rect(barX, barY, fillWidth, barHeight);

    // Add percentage text on the bar
    fill(0);
    textAlign(CENTER);
    text(
      currentYearData.activeFullnessRate.toFixed(1) + "%",
      barX + barWidth / 2,
      barY + barHeight / 2 + 4
    );

    yPos += barHeight + 20;
  }

  // Draw timeline if available
  if (dam.properties.timeline && dam.properties.timeline.length > 0) {
    textAlign(LEFT);
    fill(0);
    text("Historical Fullness Rates:", 10, yPos);
    yPos += 20;

    // Simple line chart
    let chartWidth = panelWidth - 60;
    let chartHeight = 60;
    let chartX = 35;
    let chartY = yPos;

    // Chart background
    fill(245);
    noStroke();
    rect(chartX, chartY, chartWidth, chartHeight);

    // Chart axes
    stroke(0);
    strokeWeight(1);
    line(
      chartX,
      chartY + chartHeight,
      chartX + chartWidth,
      chartY + chartHeight
    ); // x-axis
    line(chartX, chartY, chartX, chartY + chartHeight); // y-axis

    // Get timeline data
    let timelineEntry = dam.properties.timeline[0];
    let years = ["y2021", "y2022", "y2023", "y2024", "y2025"];
    let fullnessRates = years.map(
      (year) => timelineEntry[year].activeFullnessRate
    );

    // Draw year labels
    fill(0);
    noStroke();
    textAlign(CENTER);
    textSize(9);

    // Using a simple for loop
    for (let i = 0; i < years.length; i++) {
      let x = map(i, 0, years.length - 1, chartX, chartX + chartWidth);
      text(years[i].substring(1), x, chartY + chartHeight + 12); // Remove the 'y' prefix
    }

    // Draw grid lines and percentage labels
    stroke(200);
    strokeWeight(0.5);
    textAlign(RIGHT);
    textSize(8);

    for (let percent = 0; percent <= 100; percent += 25) {
      let y = map(percent, 0, 100, chartY + chartHeight, chartY);
      line(chartX, y, chartX + chartWidth, y);
      fill(0);
      text(percent + "%", chartX - 5, y + 3);
    }

    // Plot lines connecting fullness rates
    stroke(0, 100, 200);
    strokeWeight(2);
    noFill();
    beginShape();

    // Using a simple for loop with map() function
    for (let i = 0; i < fullnessRates.length; i++) {
      const rate = fullnessRates[i];
      const x = map(
        i,
        0,
        fullnessRates.length - 1,
        chartX,
        chartX + chartWidth
      );
      const y = map(rate, 0, 100, chartY + chartHeight, chartY);
      vertex(x, y);
    }

    endShape();

    // Plot points
    fill(0, 100, 200);
    noStroke();

    // Using a simple for loop with map() function for drawing ellipses
    for (let i = 0; i < fullnessRates.length; i++) {
      const rate = fullnessRates[i];
      const x = map(
        i,
        0,
        fullnessRates.length - 1,
        chartX,
        chartX + chartWidth
      );
      const y = map(rate, 0, 100, chartY + chartHeight, chartY);
      ellipse(x, y, 6, 6);
    }
  }

  // Close button
  stroke(0);
  strokeWeight(2);
  line(panelWidth - 18, 8, panelWidth - 8, 18);
  line(panelWidth - 8, 8, panelWidth - 18, 18);

  pop();

  // Check if close button is clicked - using global coordinates
  if (
    mouseIsPressed &&
    mouseX > panelX + panelWidth - 18 &&
    mouseX < panelX + panelWidth - 8 &&
    mouseY > panelY + 8 &&
    mouseY < panelY + 18
  ) {
    selectedDam = null;
  }
}

function drawUI() {
  push();

  // Draw title and legend
  noStroke();
  fill(0);
  textSize(20);
  textAlign(LEFT);
  text("Izmir Water Resources (DAY 4)", 20, 30);

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

// If click is outside the panel, deselect the dam
function mousePressed() {
  if (selectedDam) {
    if (
      !(
        mouseX > panelX &&
        mouseX < panelX + panelWidth &&
        mouseY > panelY &&
        mouseY < panelY + panelHeight
      )
    ) {
      selectedDam = null;
    }
  }
}
