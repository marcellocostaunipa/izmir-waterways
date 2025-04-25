/* 
Final Project
*/

const bounds = {
  minLon: 26.35,
  maxLon: 28.56,
  minLat: 37.89,
  maxLat: 39.46,
}

let izsuData
let izmir

let features
let maxVolume = 0
let minVolume = 0

// Initially, no dam is being hovered
let hoveredDam = null
// Initially, no dam is selected
let selectedDam = null
// Keep track of previously selected dam to detect changes
let previousSelectedDam = null

let isSelectedDam = true

// Add these variables at the beginning of your file
let yearSlider
const transitionRate = 0.1
let year = 2025
const availableYears = [2021, 2022, 2023, 2024, 2025]

// Color constants for dam fullness levels
const LOW_FULLNESS_COLOR = [0, 0, 255] // Red for low levels (0-30%)
const MED_FULLNESS_COLOR = [0, 0, 255] // Orange for medium levels (30-60%)
const HIGH_FULLNESS_COLOR = [0, 0, 255] // Blue for high levels (60-100%)

// Add this variable at the top of the file with the other variables
let previousYear = 2025

function preload() {
  izsuData = loadJSON("data/izsu.json")
  izmir = loadJSON("data/izmir.json")
}

// Add this to your setup function
function setup() {
  createCanvas(500, 500)

  // Create canvas inside the sketch-holder div
  const sketchHolder = document.getElementById("sketch-holder")
  if (sketchHolder) {
    // Make canvas responsive to the container size
    canvasWidth = sketchHolder.offsetWidth > 800 ? 800 : sketchHolder.offsetWidth - 40
    canvasHeight = canvasWidth

    canvas = createCanvas(canvasWidth, canvasHeight)
    canvas.parent("sketch-holder") // This line attaches the canvas to the div
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

  // Add the year slider
  yearSlider = createSlider(2021, 2025, 2025, 1)
  yearSlider.style("width", "100%")
  yearSlider.parent("year-slider")

  // Create year labels and add them to the year-slider container
  const yearSliderContainer = document.getElementById("year-slider")
  if (yearSliderContainer) {
    // Create a container for the year labels
    const labelsContainer = document.createElement("div")
    labelsContainer.className = "year-labels"
    labelsContainer.style.display = "flex"
    labelsContainer.style.justifyContent = "space-between"
    labelsContainer.style.width = "100%"
    labelsContainer.style.marginTop = "5px"

    // Add labels for each year
    for (const yr of availableYears) {
      const label = document.createElement("span")
      label.textContent = yr
      label.style.fontSize = "12px"
      label.style.fontWeight = yr === 2025 ? "bold" : "normal"
      label.style.color = yr === 2025 ? "#0064ff" : "#666"
      labelsContainer.appendChild(label)
    }

    // Add the labels container after the slider
    yearSliderContainer.appendChild(labelsContainer)
  }

  // Draw year labels below the slider position
  // Note: We no longer need to position the slider here since it's in an HTML element
  // Year display
  // textSize(14)
  // text("Year: " + year, 20, 45)

  // Call updateDamList in setup to initialize the list
  // Add this line at the end of the setup function:
  updateDamList()
}

// Add this function after the setup function
function updateDamList() {
  // Find the dam list container
  const damListContainer = document.querySelector(".dam-list")
  if (!damListContainer) return

  // Clear previous list items
  damListContainer.innerHTML = ""

  // Add a list item for each dam
  for (let i = 0; i < izsuData.features.length; i++) {
    const feature = izsuData.features[i]
    const damName = feature.properties.name

    // Get the current year data
    const timelineEntry = feature.properties.timeline[0]
    const currentYearData = timelineEntry[`y${year}`]
    const fullnessRate = currentYearData.activeFullnessRate

    // Create list item
    const listItem = document.createElement("li")
    listItem.className = "dam-list-item"

    // Add dam name
    const nameElement = document.createElement("h3") 
    nameElement.className = "dam-name"
    nameElement.textContent = damName

    // Create fullness bar container
    const barContainer = document.createElement("div")
    barContainer.className = "fullness-bar-container"

    // Create fullness bar fill
    const barFill = document.createElement("div")
    barFill.className = "fullness-bar-fill"
    barFill.style.width = fullnessRate + "%"
    barFill.style.height = "100%"
    barFill.style.transition = "width 0.3s ease, background-color 0.3s ease"

    // Color coding based on fullness rate
    let fillColor
    if (fullnessRate < 30) {
      fillColor = "rgba(255, 0, 0, 0.6)" // Red for low levels
    } else if (fullnessRate < 60) {
      fillColor = "rgba(255, 165, 0, 0.6)" // Orange for medium levels
    } else {
      fillColor = "rgba(0, 100, 255, 0.6)" // Blue for high levels
    }
    barFill.style.backgroundColor = fillColor

    // Create fullness bar text
    const barText = document.createElement("div")
    barText.className = "fullness-bar-text"
    barText.textContent = fullnessRate.toFixed(1) + "%"

    // Assemble the bar
    barContainer.appendChild(barFill)
    barContainer.appendChild(barText)

    // Assemble the list item
    listItem.appendChild(nameElement)
    listItem.appendChild(barContainer)

    // Add click event to select this dam
    listItem.addEventListener("click", () => {
      selectedDam = feature
      isSelectedDam = true
      document.getElementById("dam-details-container").style.display = "block"
    })

    // Add to list
    damListContainer.appendChild(listItem)
  }
}

// Helper function to get color based on fullness percentage
function getFullnessColor(fullnessRate) {
  if (fullnessRate < 30) {
    return LOW_FULLNESS_COLOR
  } else if (fullnessRate < 60) {
    return MED_FULLNESS_COLOR
  } else {
    return HIGH_FULLNESS_COLOR
  }
}

// Update your draw function to get the year from the slider
function draw() {
  background(240)
  drawIzmirBoundary()
  hoveredDam = null

  // Get the year from the slider
  year = yearSlider.value()

  // Modify the draw function to call updateDamList when the year changes
  // Add this line after "year = yearSlider.value();" in the draw function:
  if (year !== previousYear) {
    updateDamList()
    previousYear = year
  }

  // Update year label styling
  const yearLabels = document.querySelectorAll("#year-slider .year-labels span")
  if (yearLabels.length > 0) {
    yearLabels.forEach((label) => {
      const labelYear = Number.parseInt(label.textContent)
      if (labelYear === year) {
        label.style.fontWeight = "bold"
        label.style.color = "#fff"
      } else {
        label.style.fontWeight = "normal"
        label.style.color = "#fff"
      }
    })
  }

  background(0, 0, 255)

  // Draw the Izmir province boundary
  drawIzmirBoundary()

  // Draw the dams
  drawDams()

  // Draw UI elements
  // drawUI()

  // Update the HTML details panel if a dam is selected
  if (selectedDam !== previousSelectedDam) {
    updateDamDetailsHTML(selectedDam)
    previousSelectedDam = selectedDam
  }
}

function drawIzmirBoundary() {
  fill("#7979f0")
  stroke(100)
  strokeWeight(1)

  // Simplified boundary for demonstration
  beginShape()

  // To iterate through izmir.json
  const boundaryPoints = izmir.boundaryPoints

  for (let i = 0; i < boundaryPoints.length; i++) {
    const point = boundaryPoints[i]
    const pixelCoord = geoToPixel(point[0], point[1])
    vertex(pixelCoord.x, pixelCoord.y)
  }

  endShape(CLOSE)
}

function drawDams() {
  // Draw each dam as a circle
  for (let i = 0; i < izsuData.features.length; i++) {
    const feature = izsuData.features[i]

    maxVolume = Math.max(maxVolume, feature.properties.maximum.lakeVolume)
    minVolume = Math.min(minVolume, feature.properties.maximum.lakeVolume)

    const coords = feature.geometry.coordinates
    const pixelCoord = geoToPixel(coords[0], coords[1])

    // Get the current year data (using 2025 as default)
    let currentYearData
    const timelineEntry = feature.properties.timeline[0]
    currentYearData = timelineEntry[`y${year}`]

    // Calculate circle size based on maximum lake volume
    const maxLakeVolume = feature.properties.maximum.lakeVolume

    // Scale min and max diameters
    const minDiameter = 30
    const maxDiameter = 90

    const diameter = map(maxLakeVolume, minVolume, maxVolume, minDiameter, maxDiameter)

    // Draw dam circle (outer ring representing capacity)
    stroke(0, 100, 200)
    strokeWeight(2)
    fill(255)
    ellipse(pixelCoord.x, pixelCoord.y, diameter)

    // Draw water level as fill percentage if data is available
    const fullness = currentYearData.activeFullnessRate

    if (feature.prevFullnessRate === undefined) {
      feature.prevFullnessRate = fullness
    }

    const smoothFullness = lerp(feature.prevFullnessRate, fullness, transitionRate)
    feature.prevFullnessRate = smoothFullness

    // Get color based on fullness level
    const fillColor = getFullnessColor(smoothFullness)

    // Then use smoothFullness instead of activeFullnessRate for the fillDiameter calculation
    const fillDiameter = map(smoothFullness, 0, 100, 0, diameter)
    noStroke()
    fill(fillColor[0], fillColor[1], fillColor[2], fillColor[3])
    ellipse(pixelCoord.x, pixelCoord.y, fillDiameter)

    // Check if this is the selected dam and draw the red outline if it is
    if (selectedDam === feature) {
      noFill()
      stroke(255, 100, 0)
      strokeWeight(3) // Make it slightly thicker for the selected dam
      ellipse(pixelCoord.x, pixelCoord.y, diameter + 8) // Make it slightly larger for emphasis
      if (isSelectedDam) {
        /*HARD CODED!*/
        const slides = document.querySelectorAll(".slide")
        slides[4].scrollIntoView({ behavior: "smooth" })
        isSelectedDam = false
      }
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
      fill(255)
      noStroke()
      strokeWeight(1)

      // Position tooltip to avoid going off-screen
      let tooltipX = mouseX + 10
      const tooltipY = mouseY
      const tooltipWidth = 260
      const tooltipHeight = 100

      // Adjust if too close to right edge
      if (tooltipX + tooltipWidth > width) {
        tooltipX = mouseX - tooltipWidth - 10
      }

      rect(tooltipX, tooltipY, tooltipWidth, tooltipHeight)

      fill(0)
      noStroke()
      textAlign(LEFT)
      textSize(16)
      textStyle(BOLD)
      text(feature.properties.name, tooltipX + 5, tooltipY + 15)
      textStyle(NORMAL)
      text("Max Volume: " + formatVolume(maxLakeVolume), tooltipX + 5, tooltipY + 35)

      if (currentYearData) {
        text("Current Volume: " + formatVolume(currentYearData.totalWaterVolume), tooltipX + 5, tooltipY + 55)

        // Add color indicator for fullness level
        const fullnessText = "Fullness: " + currentYearData.activeFullnessRate.toFixed(1) + "%"
        const fullnessColor = getFullnessColor(currentYearData.activeFullnessRate)

        // Draw the text
        text(fullnessText, tooltipX + 5, tooltipY + 75)

        // Draw a small colored circle next to the fullness text to indicate the status
        noStroke()
        fill(fullnessColor[0], fullnessColor[1], fullnessColor[2], fullnessColor[3])
        ellipse(tooltipX + textWidth(fullnessText) + 15, tooltipY + 72, 10, 10)
      }

      // Set as selected dam if clicked
      if (mouseIsPressed) {
        // Only update if a different dam is selected
        isSelectedDam = true
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
  if (!dam) return

  // Get the HTML elements using standard DOM methods
  const titleElement = document.getElementById("dam-title")
  const detailsList = document.getElementById("dam-details-list")
  const chartContainer = document.getElementById("chart-container")

  // Update the title
  titleElement.textContent = dam.properties.name

  // Clear previous details
  detailsList.innerHTML = ""

  // Get the current year data (2025)
  let currentYearData
  if (dam.properties.timeline && dam.properties.timeline.length > 0) {
    const timelineEntry = dam.properties.timeline[0]
    currentYearData = timelineEntry[`y${year}`]
  }

  // Display area if available
  if (dam.properties.area) {
    const areaItem = document.createElement("li")
    areaItem.textContent = "Surface Area: " + dam.properties.area + " km²"
    detailsList.appendChild(areaItem)
  }

  // Display maximum capacity
  let maxVolume
  if (dam.properties.maximum) {
    maxVolume = dam.properties.maximum.lakeVolume
    const maxVolumeItem = document.createElement("li")
    maxVolumeItem.textContent = "Maximum Capacity: " + formatVolume(maxVolume)
    detailsList.appendChild(maxVolumeItem)
  }

  // Display current water data if available
  if (currentYearData) {
    // Water level
    const waterLevelItem = document.createElement("li")
    waterLevelItem.textContent = "Current Water Level: " + currentYearData.lakeWaterElevation.toFixed(2) + " m"
    detailsList.appendChild(waterLevelItem)

    // Current volume
    const currentVolumeItem = document.createElement("li")
    currentVolumeItem.textContent = "Current Volume: " + formatVolume(currentYearData.totalWaterVolume)
    detailsList.appendChild(currentVolumeItem)

    // Usable volume
    const usableVolumeItem = document.createElement("li")
    usableVolumeItem.textContent = "Usable Volume: " + formatVolume(currentYearData.usableWaterVolume)
    detailsList.appendChild(usableVolumeItem)

    // Fullness rate with bar
    const fullnessItem = document.createElement("li")
    fullnessItem.textContent = "Fullness Rate: " + currentYearData.activeFullnessRate.toFixed(2) + "%"

    // Create fullness bar container
    const barContainer = document.createElement("div")
    barContainer.className = "fullness-bar-container"

    // Create fullness bar fill
    const barFill = document.createElement("div")
    barFill.className = "fullness-bar-fill"
    barFill.style.width = currentYearData.activeFullnessRate + "%"

    // Color coding based on fullness rate
    let fillColor
    if (currentYearData.activeFullnessRate < 30) {
      fillColor = "rgba(255, 0, 0, 0.6)" // Red for low levels
    } else if (currentYearData.activeFullnessRate < 60) {
      fillColor = "rgba(255, 165, 0, 0.6)" // Orange for medium levels
    } else {
      fillColor = "rgba(0, 100, 255, 0.6)" // Blue for high levels
    }
    barFill.style.backgroundColor = fillColor

    // Create fullness bar text
    const barText = document.createElement("div")
    barText.className = "fullness-bar-text"
    barText.textContent = currentYearData.activeFullnessRate.toFixed(1) + "%"

    // Assemble the bar
    barContainer.appendChild(barFill)
    barContainer.appendChild(barText)
    fullnessItem.appendChild(barContainer)

    // Add to list
    detailsList.appendChild(fullnessItem)
  }

  // Draw timeline chart if available
  if (dam.properties.timeline && dam.properties.timeline.length > 0) {
    // Clear previous chart
    chartContainer.innerHTML = ""

    // Add chart title
    const chartTitle = document.createElement("div")
    chartTitle.className = "chart-title"
    // chartTitle.textContent = "Historical Fullness Rates:"
    // chartContainer.appendChild(chartTitle)

    // Create canvas for the chart
    const chartCanvasContainer = document.createElement("div")
    chartCanvasContainer.className = "chart-canvas"
    chartCanvasContainer.id = "timeline-chart-container"
    chartContainer.appendChild(chartCanvasContainer)

    // Create a new p5.js instance for the chart
    new p5((p) => {
      p.setup = () => {
        // Create a canvas that fits the container
        // const canvasWidth = chartCanvasContainer.offsetWidth || 500 // Default width if not set
        p.createCanvas(1200, 800)

        // Get timeline data
        const timelineEntry = dam.properties.timeline[0]
        const years = ["y2021", "y2022", "y2023", "y2024", "y2025"]
        const fullnessRates = []

        for (let i = 0; i < years.length; i++) {
          const year = years[i]
          fullnessRates.push(timelineEntry[year].activeFullnessRate)
        }

        // Draw the chart
          p.background("#0000ff")

        // Draw grid lines and percentage labels
        p.stroke(200)
        p.strokeWeight(0.5)

        for (let percent = 0; percent <= 100; percent += 25) {
          const y = p.map(percent, 0, 100, 70*2, 10)
          p.stroke(255)
          p.line(30, y, p.width - 10, y)
          p.fill(255)
          p.noStroke()
          p.textSize(14)
          p.textAlign(CENTER)
          p.text(percent + "%", 25, y + 3)
        }

        // Draw year labels
        for (let i = 0; i < years.length; i++) {
          const x = p.map(i, 0, years.length - 1, 30*2, p.width - 10)
          p.fill(255)
          p.noStroke()
          p.textSize(14)
          p.textAlign(CENTER)
          p.text(years[i].substring(1), x,160)
        }

        // Plot lines connecting fullness rates
        p.stroke(255)
        p.strokeWeight(4)
        p.noFill()
        p.beginShape()

        for (let i = 0; i < fullnessRates.length; i++) {
          const rate = fullnessRates[i]
          const x = p.map(i, 0, fullnessRates.length - 1, 30*2, p.width - 10)
          const y = p.map(rate, 0, 100, 70*2, 10)
          p.vertex(x, y)
        }

        p.endShape()

        // Plot points with color based on fullness rate
        for (let i = 0; i < fullnessRates.length; i++) {
          const rate = fullnessRates[i]
          const x = p.map(i, 0, fullnessRates.length - 1, 30*2, p.width - 10)
          const y = p.map(rate, 0, 100, 70*2, 10)

          // Set point color based on fullness rate
          if (rate < 30) {
            p.fill(255, 0, 0) // Red for low levels
          } else if (rate < 60) {
            p.fill(255, 165, 0) // Orange for medium levels
          } else {
            p.fill(0, 100, 255) // Blue for high levels
          }

          p.noStroke()
          p.ellipse(x, y, 20)
        }
      }
    }, chartCanvasContainer)
  }
}

function drawUI() {
  // Legend
  push()
  textSize(12)
  textAlign(LEFT)

  // Dam capacity symbol
  stroke(0, 100, 200)
  strokeWeight(1)
  fill(255)
  ellipse(30, height - 80, 15)
  text("Capacity", 45, height - 84)

  // Fullness level symbols with color coding
  noStroke()

  // Low fullness
  fill(LOW_FULLNESS_COLOR[0], LOW_FULLNESS_COLOR[1], LOW_FULLNESS_COLOR[2], LOW_FULLNESS_COLOR[3])
  ellipse(30, height - 60, 10)
  fill(0)
  text("Low Fullness (0-30%)", 45, height - 64)

  // Medium fullness
  fill(MED_FULLNESS_COLOR[0], MED_FULLNESS_COLOR[1], MED_FULLNESS_COLOR[2], MED_FULLNESS_COLOR[3])
  ellipse(30, height - 40, 10)
  fill(0)
  text("Medium Fullness (30-60%)", 45, height - 44)

  // High fullness
  fill(HIGH_FULLNESS_COLOR[0], HIGH_FULLNESS_COLOR[1], HIGH_FULLNESS_COLOR[2], HIGH_FULLNESS_COLOR[3])
  ellipse(30, height - 20, 10)
  fill(0)
  text("High Fullness (60-100%)", 45, height - 24)

  // Attribution
  textSize(8)
  text("2025 - Water Ways Workshop", width - 120, height - 10)
  pop()
}
