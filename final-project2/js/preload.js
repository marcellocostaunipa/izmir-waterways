/*var izsuData;
var izmir;

async function loadJSON() {
    const response1 = await fetch('data/izsu.json');
    izsuData = await response1.json();
    const response2 = await fetch('data/izmir.json');
    izmir = await response2.json();
    //console.log(names); 
    // logs [{ name: 'Joker'}, { name: 'Batman' }]

}
await loadJSON();
*/

// Variables to store the JSON data
var izsuData;
var izmir;
var yearSlider;
// Create promises for both fetch operations
const firstJsonPromise = fetch('data/izsu.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Error loading first JSON file');
    }
    return response.json();
  });

const secondJsonPromise = fetch('data/izmir.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Error loading second JSON file');
    }
    return response.json();
  });

// Wait for both promises to resolve
Promise.all([firstJsonPromise, secondJsonPromise])
  .then(results => {
    // Store the results
    [izsuData, izmir] = results;
    
    // Now that we have both datasets, initialize p5.js
    //new p5(sketch);
    var mapviewCanvas= new p5(mapview, 'p5sketch');
    var gridviewCanvas= new p5(gridview, 'p5sketch');
    switchView();
  })
  .catch(error => {
    console.error('Error loading JSON files:', error);
  });

function setup(){
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

}
function draw(){}

  // Add the year slider
