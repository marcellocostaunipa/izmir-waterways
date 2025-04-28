// Declare the selectedYear variable
let selectedYear = 2025

// Initialize the year slider when the document is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Add the year slider HTML to the sketch-holder div
  const sketchHolder = document.getElementById("sketch-holder")
  if (sketchHolder) {
    // Create the slider container element
    const sliderContainer = document.createElement("div")
    sliderContainer.className = "year-slider-container"
    sliderContainer.id = "year-slider-container"

    // Set the HTML content
    sliderContainer.innerHTML = `
      <h3>Dam Fullness by Year</h3>
      <div class="current-year" id="current-year-display">2025</div>
      <input type="range" min="2021" max="2025" value="2025" step="1" class="year-slider" id="year-slider">
      <div class="year-labels">
        <span class="year-label" data-year="2021">2021</span>
        <span class="year-label" data-year="2022">2022</span>
        <span class="year-label" data-year="2023">2023</span>
        <span class="year-label" data-year="2024">2024</span>
        <span class="year-label active" data-year="2025">2025</span>
      </div>
    `

    // Append the slider to the sketch-holder
    sketchHolder.appendChild(sliderContainer)

    // Set up event listeners
    setupYearSliderEvents()
  }
})

// Set up event listeners for the year slider
function setupYearSliderEvents() {
  const yearSlider = document.getElementById("year-slider")
  const yearLabels = document.querySelectorAll(".year-label")
  const currentYearDisplay = document.getElementById("current-year-display")

  if (yearSlider && yearLabels && currentYearDisplay) {
    // Update when slider changes
    yearSlider.addEventListener("input", function () {
      selectedYear = Number.parseInt(this.value)
      updateYearDisplay(selectedYear)
    })

    // Click on year labels to set the slider
    yearLabels.forEach((label) => {
      label.addEventListener("click", function () {
        const year = Number.parseInt(this.getAttribute("data-year"))
        yearSlider.value = year
        selectedYear = year
        updateYearDisplay(year)
      })
    })
  }
}

// Update the year display and active label
function updateYearDisplay(year) {
  const currentYearDisplay = document.getElementById("current-year-display")
  const yearLabels = document.querySelectorAll(".year-label")

  if (currentYearDisplay) {
    currentYearDisplay.textContent = year
  }

  if (yearLabels) {
    yearLabels.forEach((label) => {
      if (Number.parseInt(label.getAttribute("data-year")) === year) {
        label.classList.add("active")
      } else {
        label.classList.remove("active")
      }
    })
  }
}

// Function to get the year key based on the selected year
function getYearKey() {
  return "y" + selectedYear
}
