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

const bounds = {
  minLon: 26.35,
  maxLon: 28.56,
  minLat: 37.89,
  maxLat: 39.46,
}

function preload() {
  izsuData = loadJSON('data/izsu.json');
  izmir = loadJSON('data/izmir.json');
}


// Track which dam is hovered
let hoveredDam = null

function setup() {
  createCanvas(500, 500)
  textFont("Arial")
}

function draw() {
  background(240)

  // Draw the Izmir province boundary
  drawIzmirBoundary()

  // Draw the dams with hover effects
  drawDams()

  // Draw UI elements
  drawUI()

  // Draw tooltip for hovered dam
  if (hoveredDam) {
    drawTooltip(hoveredDam)
  }
}

function drawIzmirBoundary() {
  fill(255)
  stroke(100)
  strokeWeight(1)

  // Simplified boundary for demonstration
  beginShape()
  
//to iterate through izmir.json
  boundaryPoints = izmir.boundaryPoints;
  
  for (let point of boundaryPoints) {
    const pixelCoord = geoToPixel(point[0], point[1])
    vertex(pixelCoord.x, pixelCoord.y)
  }

  endShape(CLOSE)
}

function drawDams() {
  // Reset hovered dam
  hoveredDam = null

  // Draw each dam as a circle
  for (const feature of izsuData.features) {
    if (feature.geometry.type === "Point") {
      const coords = feature.geometry.coordinates
      const pixelCoord = geoToPixel(coords[0], coords[1])

      // Calculate circle size based on dam area
      const area = feature.properties.area || 5
      const diameter = map(area, 0, 25, 10, 40)

      // Draw water level as fill percentage
      const waterLevel = feature.properties.currentWaterLevel || 50
      const fillHeight = (waterLevel / 100) * diameter

      // Draw dam circle
      stroke(0, 100, 200)
      strokeWeight(2)
      fill(255)
      ellipse(pixelCoord.x, pixelCoord.y, diameter)

      // Fill with water level
      noStroke()
      fill(0, 100, 255, 150)
      ellipse(pixelCoord.x, pixelCoord.y, fillHeight)

      // Draw dam name
      fill(0)
      textSize(12)
      textAlign(CENTER)
      text(feature.properties.name, pixelCoord.x, pixelCoord.y - diameter / 2 - 5)

      // Check if mouse is over this dam
      if (dist(mouseX, mouseY, pixelCoord.x, pixelCoord.y) < diameter / 2) {
        // Highlight on hover
        noFill()
        stroke(255, 100, 0)
        strokeWeight(2)
        ellipse(pixelCoord.x, pixelCoord.y, diameter + 5)

        // Set as hovered dam
        hoveredDam = feature
      }
    }
  }
}

function drawTooltip(dam) {
  // Draw tooltip near mouse
  fill(255)
  stroke(0)
  strokeWeight(1)
  rect(mouseX + 10, mouseY, 120, 60)

  // Dam information
  fill(0)
  noStroke()
  textAlign(LEFT)
  textSize(12)
  text(dam.properties.name, mouseX + 15, mouseY + 15)
  text(`Area: ${dam.properties.area} km²`, mouseX + 15, mouseY + 30)
  text(`Water Level: ${dam.properties.currentWaterLevel}%`, mouseX + 15, mouseY + 45)
}

function drawUI() {
  // Draw title and legend
  noStroke()
  fill(0)
  textSize(20)
  textAlign(LEFT)
  text("Izmir Water Resources (DAY 3)", 20, 30)

  // Legend
  textSize(12)

  // Dam symbol
  stroke(0, 100, 200)
  strokeWeight(2)
  fill(255)
  ellipse(30, height - 60, 15)
  fill(0, 100, 255, 150)
  ellipse(30, height - 60, 7.5)

  fill(0)
  noStroke()
  text("Dam", 45, height - 56)

  // Attribution
  textSize(8)
  text("2025 - Waterways Workshop", 20, height - 10)
}