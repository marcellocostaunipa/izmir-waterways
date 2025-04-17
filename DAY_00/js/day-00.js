/* Day 00: Basic Shapes */

let lakes = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);

  fetch("https://openapi.izmir.bel.tr/api/izsu/barajdurum")
    .then((response) => response.json())
    .then(gotData)
    .catch((error) => console.error("Error:", error));
  
}

function gotData(data) {

    // Map over the array of lakes
    lakes = data.map((item) => {
      return {
        name: item.BarajKuyuAdi,
        waterLevel: item.SuYuksekligi,
        capacity: item.MaksimumSuKapasitesi,
        occupancyRate: item.DolulukOrani,
      };
    });
}

function drawGraph() {
  // Example of how you might visualize the lakes
  let x = width/2;
  let y = 100;
  
  let maxCapacity = Math.max(...lakes.map(lake => lake.capacity));
  
  let maxSize = 100;
  
  for (let lake of lakes) {
    fill(255, 120);
    noStroke();
    let currentVolume = lake.capacity * (lake.occupancyRate / 100);
    print("Volume= " + currentVolume + " Capacity=" + lake.capacity);
    
    let size = map(lake.capacity,0, maxCapacity, 10, maxSize );
    
    //check this line map() or constrain() ?
    let volume = constrain(currentVolume, 0, maxSize/4);
    
//     print(lake.name + ": " + lake.capacity +" "+ lake.occupancyRate);
//     fill(255);
//     ellipse(x, y, size);
    fill(255);
    ellipse(x, y, size);
    fill(120);
    ellipse(x, y, volume);
    y += 80; // Move down for the next lake
  }
}

function draw() {
    drawGraph();
}
