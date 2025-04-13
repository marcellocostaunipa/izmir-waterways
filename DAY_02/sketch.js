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

const bounds = {
  minLon: 26.35,
  maxLon: 28.56,
  minLat: 37.89,
  maxLat: 39.46,
};

function preload() {
  izsuData = loadJSON('data/izsu.json');
  izmir = loadJSON('izmir.json');
}

function setup() {
  createCanvas(500, 500);
  textFont("Arial");
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
  
  //to iterate through izmir.json
  boundaryPoints = izmir.boundaryPoints;
  
  for (const point of boundaryPoints) {
    const pixelCoord = geoToPixel(point[0], point[1]);
    vertex(pixelCoord.x, pixelCoord.y);
  }

  endShape(CLOSE);
}

function drawDams() {
  // Draw each dam as a circle
  for (let feature of izsuData.features) {
    if (feature.geometry.type === "Point") {
      const coords = feature.geometry.coordinates;
      const pixelCoord = geoToPixel(coords[0], coords[1]);

      // Calculate circle size based on dam area
      const area = feature.properties.area || 5;
      const diameter = map(area, 0, 25, 10, 40);

      // Draw water level as fill percentage
      const waterLevel = feature.properties.currentWaterLevel || 50;
      const fillHeight = (waterLevel / 100) * diameter;

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
    }
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
