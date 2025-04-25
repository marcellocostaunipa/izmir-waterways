//let maxVolume = 0;
//let minVolume = Infinity;

//let selectedYear = 2025;
//let previousYear = 2021;

//let yearSlider; // Will be an HTML element now
let yearLabel; // HTML element to display the selected year
let yearsKeys = ["y2021", "y2022", "y2023", "y2024", "y2025"];
let damStates = [];
let maxDiameter = 0; // Track the maximum diameter for alignment

// HTML elements for labels
let labelContainers = [];
let nameLabels = [];
let percentLabels = [];
/*
function preload() {
  izsuData = loadJSON("data/izsu.json");
  izmir = loadJSON("data/izmir.json");
}*/
var gridview = function (gridview) { 
  let gridviewCanvas = document.getElementById("gridviewCanvas");
  gridview.setup =function() {
    gridview.createCanvas(1200, 600,P2D,gridviewCanvas);
    gridview.textFont("Arial");

  // Create HTML controls container
  let controlsContainer = createDiv('');
  controlsContainer.id('controls-container');
  controlsContainer.style('position', 'absolute');
  controlsContainer.style('bottom', '20px');
  controlsContainer.style('right', '20px');
  controlsContainer.style('width', '200px');
  controlsContainer.style('text-align', 'center');
  
  // Create year label
  yearLabel = createDiv('Year: 2025');
  yearLabel.id('year-label');
  yearLabel.style('font-family', 'Arial, sans-serif');
  yearLabel.style('font-size', '16px');
  yearLabel.style('font-weight', 'bold');
  yearLabel.style('margin-bottom', '8px');
  yearLabel.parent(controlsContainer);
  /*
  // Create HTML slider
  yearSlider = gridview.createSlider(2021, 2025, 2025, 1);
  yearSlider.id('year-slider');
  yearSlider.style('width', '180px');
  yearSlider.style('height', '20px');
  yearSlider.style('margin', '0 auto');
  yearSlider.style('cursor', 'pointer');
  
  // Add custom styling to the slider
  yearSlider.style('-webkit-appearance', 'none');
  yearSlider.style('background', '#d3d3d3');
  yearSlider.style('outline', 'none');
  yearSlider.style('border-radius', '10px');
  */
  // Style the slider thumb
    /*
  let thumbStyle = `
    #year-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 25px;
      height: 25px;
      border-radius: 50%;
      background: #0066cc;
      cursor: pointer;
    }
    #year-slider::-moz-range-thumb {
      width: 25px;
      height: 25px;
      border-radius: 50%;
      background: #0066cc;
      cursor: pointer;
    }
  `;
  
  let styleElement = createElement('style', thumbStyle);
  document.head.appendChild(styleElement.elt);

  // Add event listener for slider change
  yearSlider.input(updateYear);
  yearSlider.parent(controlsContainer);
  /*
  // Create year markers below the slider
  let yearMarkersContainer = createDiv('');
  yearMarkersContainer.style('display', 'flex');
  yearMarkersContainer.style('justify-content', 'space-between');
  yearMarkersContainer.style('width', '180px');
  yearMarkersContainer.style('margin', '5px auto 0');
  yearMarkersContainer.parent(controlsContainer);
  
  // Add year markers
  for (let year = 2021; year <= 2025; year++) {
    let marker = createDiv(year.toString());
    marker.style('font-size', '10px');
    marker.style('color', '#666');
    marker.parent(yearMarkersContainer);
  }
*/
  // Preprocess volumes and initialize dam states
  for (let i = 0; i < izsuData.features.length; i++) {
    let feature = izsuData.features[i];
    let vol = feature.properties.maximum.lakeVolume;
    maxVolume = Math.max(maxVolume, vol);
    minVolume = Math.min(minVolume, vol);

    damStates.push({
      name: feature.properties.name,
      coords: feature.geometry.coordinates,
      targetFill: 0,
      currentFill: 0,
      maxLakeVolume: vol,
    });
  }
  
  // Pre-calculate the maximum diameter
  for (let i = 0; i < damStates.length; i++) {
    let diameter = map(damStates[i].maxLakeVolume, minVolume, maxVolume, 30, 100);
    maxDiameter = Math.max(maxDiameter, diameter);
  }
  
  // Create HTML elements for labels
  createHTMLLabels();
}
/*
function updateYear() {
  selectedYear = yearSlider.value();
  yearLabel.html('Year: ' + selectedYear);
}*/

function createHTMLLabels() {
  // Remove any existing labels first
  for (let i = 0; i < labelContainers.length; i++) {
    if (labelContainers[i]) {
      labelContainers[i].remove();
    }
  }
  
  labelContainers = [];
  nameLabels = [];
  percentLabels = [];
  
  // Create new label elements for each dam
  for (let i = 0; i < damStates.length; i++) {
    // Create container div for each dam's labels
    let container = createDiv('');
    container.class('dam-label-container');
    container.style('position', 'absolute');
    container.style('text-align', 'center');
    container.style('width', '120px');
    container.style('margin-left', '-60px'); // Center the div
    
    // Create name label
    let nameLabel = createDiv(damStates[i].name);
    nameLabel.class('dam-name');
    /*nameLabel.style('font-family', 'Arial, sans-serif');*/
    nameLabel.style('font-size', '12px');
    nameLabel.style('font-weight', 'bold');
    nameLabel.style('margin-bottom', '4px');
    nameLabel.style('padding-bottom', '10px');
    nameLabel.style('border-bottom', '2px #fff solid');
    nameLabel.parent(container);
    
    // Create percentage label
    let percentLabel = createDiv('0%');
    percentLabel.class('dam-percent');
    /*percentLabel.style('font-family', 'Arial, sans-serif');*/
    percentLabel.style('font-size', '42px');
    nameLabel.style('font-weight', 'bold');
    percentLabel.style('color', '#0066cc');
    percentLabel.parent(container);
    
    labelContainers.push(container);
    nameLabels.push(nameLabel);
    percentLabels.push(percentLabel);
    let gridviewCanvas= document.getElementById("gridviewCanvasDiv");
    container.parent(gridviewCanvas); // Append to the gridview canvas
  }
}

gridview.draw= function() {
  /*gridview.background(220);*/
  year = yearSlider.value()
  gridview.clear();
  //console.log(year)
  yearLabel.html('Year: ' + year);
  
  drawDamsInRow();
  updateHTMLLabels();

  previousYear = year;
}

function drawDamsInRow() {
  let hoverDam = null;
  let rowY = gridview.height / 2 - 30; // Move dams up to make room for labels
  let spacing = gridview.width / (damStates.length + 1);
  
  for (let i = 0; i < damStates.length; i++) {
    let dam = damStates[i];
    let xPos = spacing * (i + 1);
    
    // Get timeline data
    let yearKey = "y" + year;
    let timelineEntry = izsuData.features[i].properties.timeline[0];
    let currentYearData = timelineEntry[yearKey];
    
    // Update target fill value
    dam.targetFill = currentYearData.activeFullnessRate;
    let totalWaterVolume = currentYearData.totalWaterVolume;

    // Animate fill change (lerp for smooth transition)
    dam.currentFill = lerp(dam.currentFill, dam.targetFill, 0.1);

    // Calculate visual size
    let diameter = map(dam.maxLakeVolume, minVolume, maxVolume, 50, 150);
    let fillDiameter = map(dam.currentFill, 0, 100, 0, diameter);

    gridview.push();
    gridview.translate(xPos, rowY);

    // Draw dam outer circle
    gridview.stroke(0, 100, 200);
    gridview.strokeWeight(2);
    gridview.fill(255);
    gridview.ellipse(0, 0, diameter);

    // Fill circle
    gridview.noStroke();
    gridview.fill(0, 100, 255, 150);
    gridview.ellipse(0, 0, fillDiameter);
    
    // Draw year markers
    for (let j = 0; j <= 4; j++) {
      let lineX = map(j, 0, 4, -diameter/2, diameter/2);
      gridview.stroke(0);
      gridview.strokeWeight(1);
      let lineY = map(timelineEntry[yearsKeys[j]].totalWaterVolume, 0, dam.maxLakeVolume, -diameter/2, diameter/2);
      gridview.strokeWeight(2);
      gridview.line(lineX, -lineY, lineX, lineY);
    }
    
    // Hover detection
    if (dist(gridview.mouseX, gridview.mouseY, xPos, rowY) < diameter / 2) {
      hoverDam = {
        name: dam.name,
        value: dam.currentFill.toFixed(1) + "%",
        volume: totalWaterVolume.toFixed(2) + " hm³",
        maxVolume: dam.maxLakeVolume.toFixed(2) + " hm³",
        x: xPos,
        y: rowY - diameter / 2 - 40
      };
    }
    
    gridview.pop();
  }

  // Draw hover tooltip
  if (hoverDam) {
    drawTooltip(hoverDam);
  }
}

function updateHTMLLabels() {
  let rowY = gridview.height / 2 - 30;
  let spacing = gridview.width / (damStates.length + 1);
  let labelY = rowY + maxDiameter / 2 + 150; // Consistent label position
  
  for (let i = 0; i < damStates.length; i++) {
    let xPos = spacing * (i + 1);
    let dam = damStates[i];
    
    // Update label positions
    labelContainers[i].position(xPos, labelY);
    
    // Update percentage text
    percentLabels[i].html(dam.currentFill.toFixed(1) + "%");
    
    // Change color based on fill percentage
    let fillColor;
    if (dam.currentFill < 30) {
      fillColor = '#cc0000'; // Red for low levels
    } else if (dam.currentFill < 70) {
      fillColor = '#ff9900'; // Orange for medium levels
    } else {
      fillColor = '#009900'; // Green for high levels
    }
    percentLabels[i].style('color', fillColor);
  }
}

function drawTooltip(info) {
  gridview.fill(255);
  gridview.rectMode(LEFT);
  gridview.noStroke();
  gridview.rect(info.x-5, info.y-30, 220, 58);
  
  gridview.fill(0);
  gridview.noStroke();
  gridview.textAlign(LEFT);
  gridview.textSize(12);
  gridview.text(info.name, info.x, info.y - 15);
  gridview.text("Current: " + info.value + " (" + info.volume + ")", info.x, info.y + 5);
  gridview.text("Max: " + info.maxVolume, info.x, info.y + 20);
}
}