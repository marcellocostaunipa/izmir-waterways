/* 
Final Project
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
// Initially, no dam is selected
let selectedDam = null;
// Keep track of previously selected dam to detect changes
let previousSelectedDam = null

function preload() {
  izsuData = loadJSON("data/izsu.json");
  izmir = loadJSON("data/izmir.json");
}

function setup() {
  createCanvas(500, 500);

  // Create canvas inside the sketch-holder div
    const sketchHolder = document.getElementById("sketch-holder")
    if (sketchHolder) {
      // Make canvas responsive to the container size
      canvasWidth = sketchHolder.offsetWidth > 800 ? 800 : sketchHolder.offsetWidth - 40
      canvasHeight = canvasWidth

      canvas = createCanvas(canvasWidth, canvasHeight)
      canvas.parent("sketch-holder")  // This line attaches the canvas to the div
    } else {
      // Fallback if the sketch-holder div is not found
      canvas = createCanvas(canvasWidth, canvasHeight)
    }

    const closeButton = document.getElementById("close-button")
    if (closeButton) {
      closeButton.addEventListener("click", (e) => {
        // Stop event propagation to prevent any parent handlers from firing
        e.stopPropagation()
        // Reset selected dam
        selectedDam = null
        previousSelectedDam = null
        // Hide the details container
        document.getElementById("dam-details-container").style.display = "none"
      })
      console.log("Close button event listener attached")
    }
}


function draw() {
  background(240);

  // Draw the Izmir province boundary
  drawIzmirBoundary();

  // Draw the dams
  drawDams();

  // Draw UI elements
  drawUI();

  // Update the HTML details panel if a dam is selected
  if (selectedDam !== previousSelectedDam) {
    updateDamDetailsHTML(selectedDam);
    previousSelectedDam = selectedDam;
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
    let minDiameter = 30;
    let maxDiameter = 90;

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

    // Check if this is the selected dam and draw the red outline if it is
    if (selectedDam === feature) {
      noFill()
      stroke(255, 100, 0)
      strokeWeight(3) // Make it slightly thicker for the selected dam
      ellipse(pixelCoord.x, pixelCoord.y, diameter + 8) // Make it slightly larger for emphasis
    }

    // Check if mouse is over this dam
    if (dist(mouseX, mouseY, pixelCoord.x, pixelCoord.y) < diameter / 2) {
      // Highlight on hover (only if not already selected)
      if (selectedDam !== feature) {
        noFill()
        stroke(255, 100, 0)
        strokeWeight(2)
        ellipse(pixelCoord.x, pixelCoord.y, diameter + 5)
      }

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
      text(feature.properties.name, tooltipX + 5, tooltipY + 15);
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
        // Only update if a different dam is selected
        if (selectedDam !== feature) {
          selectedDam = feature
          // Show the details container
          document.getElementById("dam-details-container").style.display = "block"
        }
      }
    }
  }
}

// Update the HTML details panel
function updateDamDetailsHTML(dam) {
  if (!dam) return;

  // Get the HTML elements using standard DOM methods
  let titleElement = document.getElementById("dam-title");
  let detailsList = document.getElementById("dam-details-list");
  let chartContainer = document.getElementById("chart-container");

  // Update the title
  titleElement.textContent = dam.properties.name;

  // Clear previous details
  detailsList.innerHTML = "";

  // Get the current year data (2025)
  let currentYearData;
  if (dam.properties.timeline && dam.properties.timeline.length > 0) {
    let timelineEntry = dam.properties.timeline[0];
    currentYearData = timelineEntry.y2025;
  }

  // Display area if available
  if (dam.properties.area) {
    let areaItem = document.createElement("li");
    areaItem.textContent = "Surface Area: " + dam.properties.area + " km²";
    detailsList.appendChild(areaItem);
  }

  // Display maximum capacity
  let maxVolume;
  if (dam.properties.maximum) {
    maxVolume = dam.properties.maximum.lakeVolume;
    let maxVolumeItem = document.createElement("li");
    maxVolumeItem.textContent = "Maximum Capacity: " + formatVolume(maxVolume);
    detailsList.appendChild(maxVolumeItem);
  }

  // Display current water data if available
  if (currentYearData) {
    // Water level
    let waterLevelItem = document.createElement("li");
    waterLevelItem.textContent =
      "Current Water Level: " +
      currentYearData.lakeWaterElevation.toFixed(2) +
      " m";
    detailsList.appendChild(waterLevelItem);

    // Current volume
    let currentVolumeItem = document.createElement("li");
    currentVolumeItem.textContent =
      "Current Volume: " + formatVolume(currentYearData.totalWaterVolume);
    detailsList.appendChild(currentVolumeItem);

    // Usable volume
    let usableVolumeItem = document.createElement("li");
    usableVolumeItem.textContent =
      "Usable Volume: " + formatVolume(currentYearData.usableWaterVolume);
    detailsList.appendChild(usableVolumeItem);

    // Fullness rate with bar
    let fullnessItem = document.createElement("li");
    fullnessItem.textContent =
      "Fullness Rate: " + currentYearData.activeFullnessRate.toFixed(2) + "%";

    // Create fullness bar container
    let barContainer = document.createElement("div");
    barContainer.className = "fullness-bar-container";

    // Create fullness bar fill
    let barFill = document.createElement("div");
    barFill.className = "fullness-bar-fill";
    barFill.style.width = currentYearData.activeFullnessRate + "%";
    
//     console.log(currentYearData.activeFullnessRate);

    // Color coding based on fullness rate
    let fillColor;
    if (currentYearData.activeFullnessRate < 30) {
      fillColor = "rgba(255, 0, 0, 0.6)"; // Red for low levels
    } else if (currentYearData.activeFullnessRate < 60) {
      fillColor = "rgba(255, 165, 0, 0.6)"; // Orange for medium levels
    } else {
      fillColor = "rgba(0, 100, 255, 0.6)"; // Blue for high levels
    }
    barFill.style.backgroundColor = fillColor;

    // Create fullness bar text
    let barText = document.createElement("div");
    barText.className = "fullness-bar-text";
    barText.textContent = currentYearData.activeFullnessRate.toFixed(1) + "%";

    // Assemble the bar
    barContainer.appendChild(barFill);
    barContainer.appendChild(barText);
    fullnessItem.appendChild(barContainer);

    // Add to list
    detailsList.appendChild(fullnessItem);
  }

  // Draw timeline chart if available
  if (dam.properties.timeline && dam.properties.timeline.length > 0) {
    // Clear previous chart
    chartContainer.innerHTML = "";

    // Add chart title
    let chartTitle = document.createElement("div");
    chartTitle.className = "chart-title";
    chartTitle.textContent = "Historical Fullness Rates:";
    chartContainer.appendChild(chartTitle);

    // Create canvas for the chart
    let chartCanvasContainer = document.createElement("div");
    chartCanvasContainer.className = "chart-canvas";
    chartCanvasContainer.id = "timeline-chart-container";
    chartContainer.appendChild(chartCanvasContainer);

    // Create a new p5.js instance for the chart
    new p5((p) => {
      p.setup = () => {
        // Create a canvas that fits the container
        let canvasWidth = chartCanvasContainer.offsetWidth || 240; // Default width if not set
        p.createCanvas(canvasWidth, 85);

        // Get timeline data
        let timelineEntry = dam.properties.timeline[0];
        let years = ["y2021", "y2022", "y2023", "y2024", "y2025"];
        let fullnessRates = [];

        for (let i = 0; i < years.length; i++) {
          let year = years[i];
          fullnessRates.push(timelineEntry[year].activeFullnessRate);
        }

        // Draw the chart
        p.background(245);

        // Draw grid lines and percentage labels
        p.stroke(200);
        p.strokeWeight(0.5);

        for (let percent = 0; percent <= 100; percent += 25) {
          let y = p.map(percent, 0, 100, 70, 10);
          p.stroke(0);
          p.line(30, y, p.width - 10, y);
          p.fill(0);
          p.noStroke();
          p.textSize(8);
          p.textAlign(p.RIGHT);
          p.text(percent + "%", 25, y + 3);
        }

        // Draw year labels
        for (let i = 0; i < years.length; i++) {
          let x = p.map(i, 0, years.length - 1, 30, p.width - 10);
          p.fill(0);
          p.noStroke();
          p.textSize(8);
          p.textAlign(p.CENTER);
          p.text(years[i].substring(1), x, 83);
        }

        // Plot lines connecting fullness rates
        p.stroke(0, 100, 200);
        p.strokeWeight(2);
        p.noFill();
        p.beginShape();

        for (let i = 0; i < fullnessRates.length; i++) {
          let rate = fullnessRates[i];
          let x = p.map(i, 0, fullnessRates.length - 1, 30, p.width - 10);
          let y = p.map(rate, 0, 100, 70, 10);
          p.vertex(x, y);
        }

        p.endShape();

        // Plot points
        p.fill(0, 100, 200);
        p.noStroke();

        for (let i = 0; i < fullnessRates.length; i++) {
          let rate = fullnessRates[i];
          let x = p.map(i, 0, fullnessRates.length - 1, 30, p.width - 10);
          let y = p.map(rate, 0, 100, 70, 10);
          p.ellipse(x, y, 6, 6);
        }
      };
    }, chartCanvasContainer);
  }
}

function drawUI() {
  push();


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
