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

  //to iterate through izmir.json
  boundaryPoints = izmir.boundaryPoints;

  for (let point of boundaryPoints) {
    let pixelCoord = geoToPixel(point[0], point[1]);
    vertex(pixelCoord.x, pixelCoord.y);
  }

  endShape(CLOSE);
}

function drawDams() {
  // Reset hovered dam
  hoveredDam = null;

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

      // Draw dam name
      fill(0);
      textSize(12);
      textAlign(CENTER);
      text(
        feature.properties.name,
        pixelCoord.x,
        pixelCoord.y - diameter / 2 - 5
      );

      // Check if mouse is over this dam
      if (dist(mouseX, mouseY, pixelCoord.x, pixelCoord.y) < diameter / 2) {
        // Highlight on hover
        noFill();
        stroke(255, 100, 0);
        strokeWeight(2);
        ellipse(pixelCoord.x, pixelCoord.y, diameter + 5);

        // Set as hovered dam
        hoveredDam = feature;
      }
    }
  }
}

function drawTooltip(dam) {
  // Draw tooltip near mouse
  fill(255);
  stroke(0);
  strokeWeight(1);
  rect(mouseX + 10, mouseY, 120, 60);

  // Dam information
  fill(0);
  noStroke();
  textAlign(LEFT);
  textSize(12);
  text(dam.properties.name, mouseX + 15, mouseY + 15);
  text("Area: " + dam.properties.area + " km²", mouseX + 15, mouseY + 30);
  text("Water Level: " + dam.properties.currentWaterLevel + "%", mouseX + 15, mouseY + 45);
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
  text("Water level", 45, height - 36);

  // Attribution
  textSize(8);
  text("2025 - Waterways Workshop", width - 115, height - 10);
  pop();
}
