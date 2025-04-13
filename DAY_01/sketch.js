/* 

Day 01: Basic Map and Geographic Concepts

**Morning Session: Fundamentals of p5.js and Geographic Concepts**

- Introduction to p5.js: setup(), draw(), and basic shapes
- Understanding geographic coordinates vs. pixel coordinates
- Creating a simple map with basic shapes
- Implementing the geoToPixel() function to convert between coordinate systems

**Afternoon Session: Working with GeoJSON Data**

- Introduction to GeoJSON format and structure
- Loading and parsing geographic data
- Plotting points on a map
- Creating a simple visualization of dam locations

**Hands-on Exercise:**

- Create a basic map showing the Izmir province as a rectangle
- Plot the dam locations as simple circles
- Add labels for each dam

*/

// Geographic bounds of our map
const bounds = {
  minLon: 26.35,
  maxLon: 28.56,
  minLat: 37.89,
  maxLat: 39.46,
};

let jsonData;

function preload() {
  izsuData = loadJSON('data/izsu.json');
}

function setup() {
  createCanvas(500, 500);
  textFont("Arial");
}

function draw() {
  background(240);

  // Draw a simple rectangle to represent Izmir province
  fill(255);
  stroke(0);
  strokeWeight(1);
  rect(50, 50, width - 100, height - 100);

  // Draw the dams as simple circles
  drawDams();

  // Draw title
  fill(0);
  textSize(20);
  textAlign(CENTER);
  text("Izmir Water Resources (DAY 1)", width / 2, 30);
}

function drawDams() {
  // Draw each dam as a circle
  for (let feature of izsuData.features) {
    if (feature.geometry.type === "Point") {
      const coords = feature.geometry.coordinates;
      const pixelCoord = geoToPixel(coords[0], coords[1]);

      // Draw dam circle
      fill(0, 100, 255);
      noStroke();
      ellipse(pixelCoord.x, pixelCoord.y, 20);

      // Draw dam name
      fill(0);
      textSize(12);
      textAlign(CENTER);
      text(feature.properties.name, pixelCoord.x, pixelCoord.y - 15);
    }
  }
}
