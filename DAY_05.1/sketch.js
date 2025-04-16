/* 
Day 5.1: Add dam shapes in details panel (fixed aspect ratio)
*/

let bounds = {
  minLon: 26.35,
  maxLon: 28.56,
  minLat: 37.89,
  maxLat: 39.46,
};

let izsuData;
let izmir;
let damShapes = {}; // Object to store dam shape data by name

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

  // Load dam shape data
  loadJSON("data/dams/balcovaData.json", function (data) {
    damShapes["Balçova Dam"] = data.balcovaData;
  });

  // You can add more dam shapes here as they become available
  // Example: loadJSON('dams/tahtaliData.json', function(data) { damShapes["Tahtalı Dam"] = data.tahtaliData; });
}

function setup() {
  createCanvas(500, 500);
  textFont("Arial");

  panelWidth = 280;
  panelHeight = 300;
  panelX = width - panelWidth - 20;
  panelY = 50;
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

  // Iterate through izmir.json
  boundaryPoints = izmir.boundaryPoints;

  for (let point of boundaryPoints) {
    let pixelCoord = geoToPixel(point[0], point[1]);
    vertex(pixelCoord.x, pixelCoord.y);
  }

  endShape(CLOSE);
}

function drawDams() {
  // Draw each dam as a circle
  for (let feature of izsuData.features) {
    if (feature.geometry.type === "Point") {
      let coords = feature.geometry.coordinates;
      let pixelCoord = geoToPixel(coords[0], coords[1]);

      // Calculate circle size based on dam area
      let area = feature.properties.area || 5;
      let diameter = map(area, 0, 25, 10, 40);

      // Draw water level as fill percentage
      let waterLevel = feature.properties.currentWaterLevel || 50;
      let fillHeight = (waterLevel / 100) * diameter;

      // Draw dam circle
      stroke(0, 100, 200);
      strokeWeight(2);
      fill(255);
      ellipse(pixelCoord.x, pixelCoord.y, diameter);

      // Fill with water level
      noStroke();
      fill(0, 100, 255, 150);
      ellipse(pixelCoord.x, pixelCoord.y, fillHeight);

      // Draw dam name if a dam is selected
      if (
        selectedDam &&
        selectedDam.properties.name === feature.properties.name
      ) {
        fill(0);
        textSize(12);
        text(
          feature.properties.name,
          pixelCoord.x,
          pixelCoord.y - diameter / 2 - 5
        );
      }

      // Check if mouse is over this dam
      if (dist(mouseX, mouseY, pixelCoord.x, pixelCoord.y) < diameter / 2) {
        // Highlight on hover
        noFill();
        stroke(255, 100, 0);
        strokeWeight(2);
        ellipse(pixelCoord.x, pixelCoord.y, diameter + 5);

        // Show tooltip
        fill(255);
        stroke(0);
        strokeWeight(1);
        rect(mouseX + 10, mouseY, 120, 60);

        fill(0);
        noStroke();
        textSize(12);
        text(feature.properties.name, mouseX + 15, mouseY + 15);
        text(`Area: ${area} km²`, mouseX + 15, mouseY + 30);
        text(`Water Level: ${waterLevel}%`, mouseX + 15, mouseY + 45);

        // Set as selected dam if clicked
        if (mouseIsPressed) {
          selectedDam = feature;
        }
      }
    }
  }
}

function drawDamDetails(dam) {
  // Draw detailed information panel for the selected dam
  let panelWidth = 280;
  let panelHeight = 220;
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
  text(dam.properties.name, 10, 25);

  textSize(12);
  text(`Area: ${dam.properties.area} km²`, 10, 50);
  text(`Current Water Level: ${dam.properties.currentWaterLevel}%`, 10, 70);

  let damCurrentWaterLevel = dam.properties.currentWaterLevel;
  if (damCurrentWaterLevel) {
    // Draw water level bar
    let barWidth = panelWidth - 20;
    let barHeight = 20;
    let barX = 10;
    let barY = 85;

    // Bar outline
    noFill();
    stroke(0);
    strokeWeight(1);
    rect(barX, barY, barWidth, barHeight);

    // Fill based on water level
    let fillWidth = (damCurrentWaterLevel / 100) * barWidth;
    fill(0, 100, 255, 150);
    noStroke();
    rect(barX, barY, fillWidth, barHeight);
  }

  // Draw timeline if available
  let timeline = dam.properties.timeline;
  if (timeline.length > 1) {
    textSize(12);
    fill(0);
    text("Historical Water Levels:", 10, 130);

    // Simple line chart
    let chartWidth = 230;
    let chartHeight = 50;
    let chartX = 25;
    let chartY = 130;

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

    // Draw year labels
    fill(0);
    noStroke();
    textSize(10);

    // First year label
    let firstEntry = timeline[0];
    let firstX = chartX;
    text(firstEntry.year, firstX, chartY + chartHeight + 12);

    // Last year label
    let lastEntry = timeline[timeline.length - 1];
    let lastX = chartX + chartWidth;
    text(lastEntry.year, lastX, chartY + chartHeight + 12);

    // Plot lines
    stroke(0, 100, 200);
    strokeWeight(2);
    noFill();

    for (let i = 0; i < timeline.length - 1; i++) {
      let entry = timeline[i];
      let nextEntry = timeline[i + 1];

      // Map index to x-coordinate
      let x1 = map(i, 0, timeline.length - 1, chartX, chartX + chartWidth);
      // Map water level to y-coordinate (note the inverted target range)
      let y1 = map(entry.level, 0, 100, chartY + chartHeight, chartY);

      // Map next index to x-coordinate
      let x2 = map(i + 1, 0, timeline.length - 1, chartX, chartX + chartWidth);
      // Map next water level to y-coordinate
      let y2 = map(nextEntry.level, 0, 100, chartY + chartHeight, chartY);

      line(x1, y1, x2, y2);
    }

    // Plot points
    fill(0, 100, 200);
    noStroke();
    for (let i = 0; i < timeline.length; i++) {
      let entry = timeline[i];
      let x = map(i, 0, timeline.length - 1, chartX, chartX + chartWidth);
      let y = map(entry.level, 0, 100, chartY + chartHeight, chartY);
      ellipse(x, y, 5, 5);
    }
  }

  // Close button
  stroke(0);
  strokeWeight(2);
  line(panelWidth - 18, 8, panelWidth - 8, 18);
  line(panelWidth - 8, 8, panelWidth - 18, 18);

  // Calculate mouse position relative to the panel
  let localMouseX = mouseX - panelX;
  let localMouseY = mouseY - panelY;

  // Check if close button is clicked
  if (
    mouseIsPressed &&
    localMouseX > panelWidth - 18 &&
    localMouseX < panelWidth - 8 &&
    localMouseY > 8 &&
    localMouseY < 18
  ) {
    selectedDam = null;
  }

  // Draw dam shape if available
  let damName = dam.properties.name;
  if (damShapes[damName]) {
    // Draw a title for the shape
    fill(0);
    noStroke();

    // Set up a clipping region for the dam shape
    let shapeWidth = 260;
    let shapeHeight = 80;
    let shapeX = 10;
    let shapeY = 130;

    // Draw shape background
    fill(240);
    noStroke();
    rect(shapeX, shapeY, shapeWidth, shapeHeight);

    // Draw the dam shape
    push(); // Save current drawing state

    // Create a mini-viewport for the dam shape
    translate(shapeX, shapeY);

    // Draw the dam shape with a light blue fill
    fill(200, 230, 255);
    stroke(0, 100, 200);
    strokeWeight(1);

    // Calculate custom bounds for this specific shape
    let shapeBounds = calculateBounds(damShapes[damName]);

    // Preserve aspect ratio when drawing the shape
    let shapeAspectRatio =
      (shapeBounds.maxLon - shapeBounds.minLon) /
      (shapeBounds.maxLat - shapeBounds.minLat);
    let boxAspectRatio = shapeWidth / shapeHeight;

    let adjustedWidth = shapeWidth;
    let adjustedHeight = shapeHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (shapeAspectRatio > boxAspectRatio) {
      // Shape is wider than the box, adjust height and center vertically
      adjustedHeight = shapeWidth / shapeAspectRatio;
      offsetY = (shapeHeight - adjustedHeight) / 2;
    } else {
      // Shape is taller than the box, adjust width and center horizontally
      adjustedWidth = shapeHeight * shapeAspectRatio;
      offsetX = (shapeWidth - adjustedWidth) / 2;
    }

    // Draw the shape with preserved aspect ratio
    drawMultiPolygonWithSize(
      damShapes[damName],
      shapeBounds,
      adjustedWidth,
      adjustedHeight,
      offsetX,
      offsetY,
      5
    );

    pop(); // Restore panel state
  }

  pop(); // Restore drawing state
}

function drawUI() {
  push();
  
  // Draw title and legend
  noStroke();
  fill(0);
  textSize(20);
  textAlign(LEFT);
  text("Izmir Water Resources (DAY 5.1)", 20, 30);
  
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
  text("Water level", 45, height - 36);

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
