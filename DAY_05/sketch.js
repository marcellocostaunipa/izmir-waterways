/* 

Day 5: Add layers

*/

const bounds = {
  minLon: 26.35,
  maxLon: 28.56,
  minLat: 37.89,
  maxLat: 39.46,
};

let izsuData;
let izmir;
let balcovaData;

// Track which dam is selected
let selectedDam = null;

function preload() {
  izsuData = loadJSON('data/izsu.json');
  izmir = loadJSON('data/izmir.json');
  balcovaDams = loadJSON('data/dams/balcovaData.json');
}

function setup() {
  createCanvas(500, 500);
  textFont("Arial");
//   console.log(balcovaDams);
}

function draw() {
  background(240);

  // Draw the Izmir province boundary
  drawIzmirBoundary();
  
  //to iterate through balcovaDams.json
  let balcovaData = balcovaDams.balcovaData;
  
  // Draw the Dam's MultiPolygon
  drawMultiPolygon(balcovaData, bounds, width, height, 40);

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
 
  //to iterate through izmir.json
  boundaryPoints = izmir.boundaryPoints;
  
//   console.log(boundaryPoints);

  for (const point of boundaryPoints) {
    const pixelCoord = geoToPixel(point[0], point[1]);
    vertex(pixelCoord.x, pixelCoord.y);
  }

  endShape(CLOSE);
}

function drawDams() {
  // Draw each dam as a circle
  for (const feature of izsuData.features) {
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

      // Draw dam name if a dam is selected
      if (
        selectedDam &&
        selectedDam.properties.name === feature.properties.name
      ) {
        fill(0);
        textSize(12);
        textAlign(CENTER);
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
        textAlign(LEFT);
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
  const panelWidth = 280;
  const panelHeight = 220;
  const panelX = width - panelWidth - 20;
  const panelY = 50;

  // Panel background
  fill(255);
  stroke(0);
  strokeWeight(1);
  rect(panelX, panelY, panelWidth, panelHeight);

  // Dam information
  fill(0);
  noStroke();
  textAlign(LEFT);
  textSize(16);
  text(dam.properties.name, panelX + 10, panelY + 25);

  textSize(12);
  text(`Area: ${dam.properties.area} km²`, panelX + 10, panelY + 50);
  text(
    `Current Water Level: ${dam.properties.currentWaterLevel}%`,
    panelX + 10,
    panelY + 70
  );

  // Draw water level bar
  const barWidth = panelWidth - 20;
  const barHeight = 20;
  const barX = panelX + 10;
  const barY = panelY + 85;

  // Bar outline
  noFill();
  stroke(0);
  strokeWeight(1);
  rect(barX, barY, barWidth, barHeight);

  // Fill based on water level
  const fillWidth = (dam.properties.currentWaterLevel / 100) * barWidth;
  fill(0, 100, 255, 150);
  noStroke();
  rect(barX, barY, fillWidth, barHeight);

  // Draw timeline if available
  if (dam.properties.timeline && dam.properties.timeline.length > 0) {
    textSize(12);
    fill(0);
    text("Historical Water Levels:", panelX + 10, panelY + 130);

    // Simple line chart
    const chartWidth = 230;
    const chartHeight = 50;
    const chartX = panelX + 25;
    const chartY = panelY + 140;

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

    // Plot points
    const timeline = dam.properties.timeline;
    if (timeline.length > 1) {
      stroke(0, 100, 200);
      strokeWeight(2);
      noFill();

      beginShape();

      for (let i = 0; i < timeline.length; i++) {
        const entry = timeline[i];
        const x = chartX + (i / (timeline.length - 1)) * chartWidth;
        const y = chartY + chartHeight - (entry.level / 100) * chartHeight;
        vertex(x, y);

        // Year labels
        if (i === 0 || i === timeline.length - 1) {
          fill(0);
          noStroke();
          textAlign(CENTER);
          textSize(10);
          text(entry.year, x, chartY + chartHeight + 12);
        }
      }

      endShape();
    }
  }

  // Close button
  stroke(0);
  strokeWeight(2);
  line(
    panelX + panelWidth - 18,
    panelY + 8,
    panelX + panelWidth - 8,
    panelY + 18
  );
  line(
    panelX + panelWidth - 8,
    panelY + 8,
    panelX + panelWidth - 18,
    panelY + 18
  );

  // Check if close button is clicked
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
  // Draw title and legend
  noStroke();
  fill(0);
  textSize(20);
  textAlign(LEFT);
  text("Izmir Water Resources (DAY 5)", 20, 30);

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


function mousePressed() {
  // Check if we clicked outside the detail panel to deselect
  if (selectedDam) {
    const panelWidth = 280;
    const panelHeight = 220;
    const panelX = width - panelWidth - 20;
    const panelY = 50;

    if (
      !(
        mouseX > panelX &&
        mouseX < panelX + panelWidth &&
        mouseY > panelY &&
        mouseY < panelY + panelHeight
      )
    ) {
      // Only deselect if we're not clicking on a new dam (handled in drawDams)
      let clickedOnDam = false;
      for (const feature of izsuData.features) {
        if (feature.geometry.type === "Point") {
          const coords = feature.geometry.coordinates;
          const pixelCoord = geoToPixel(coords[0], coords[1]);
          const area = feature.properties.area || 5;
          const diameter = map(area, 0, 25, 10, 40);

          if (dist(mouseX, mouseY, pixelCoord.x, pixelCoord.y) < diameter / 2) {
            clickedOnDam = true;
            break;
          }
        }
      }

      if (!clickedOnDam) {
        selectedDam = null;
      }
    }
  }
}




