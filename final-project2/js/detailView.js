var detailview = function (detailview) { 
    let damShapes = {};
    let dam = null;
    let damName = "Balçova Dam";
    let panelWidth = 500;
    let panelHeight = 500;
    let yPos = 50;
    
    detailview.preload =function() {
        loadJSON("data/dams/balcovaData.json", function (data) {
            damShapes["Balçova Dam"] = data.balcovaData;
          });

    }
    detailview.setup =function() {
        let detailviewCanvas = document.getElementById("detailviewCanvas");
        detailview.createCanvas(900, 700,P2D,detailViewCanvas);
    }

    detailview.draw =function() {
        detailview.background(0, 0, 255);
        detailview.stroke(255);
        detailview.strokeWeight(1);
        detailview.rect(50,50,500, 500);
        detailview.fill(239, 237, 228,160)
        detailview.noStroke();
        detailview.rect(50,450,500, 100);
        drawBalcovaLake();
    }

    function drawBalcovaLake(){
    //let damName = dam.properties.name;
 // if (damShapes[damName]) {
    // Draw a title for the shape
    detailview.fill(0);
    detailview.noStroke();

    // Set up a clipping region for the dam shape
    let shapeWidth = panelWidth;
    let shapeHeight = panelHeight/3;
    let shapeX = 0;
    let shapeY = yPos;

    // Draw shape background
    detailview.fill(0,0,255);
    detailview.stroke(255);
    detailview.strokeWeight(1);
    /*detailview.rect(shapeX, shapeY, shapeWidth, shapeHeight);*/

    // Draw the dam shape
    detailview.push(); // Save current drawing state

    // Create a mini-viewport for the dam shape
    detailview.translate(shapeX, shapeY);

    // Draw the dam shape with a light blue fill
    detailview.fill(200, 230, 255);
    detailview.stroke(0, 100, 200);
    detailview.strokeWeight(1);

    // Calculate custom bounds for this specific shape
    let shapeBounds = calculateBounds(damShapes[damName]);

    // Preserve aspect ratio when drawing the shape
    let shapeAspectRatio =
      (shapeBounds.maxLon - shapeBounds.minLon) /
      (shapeBounds.maxLat - shapeBounds.minLat);
    let boxAspectRatio = shapeWidth / shapeHeight;

    let adjustedWidth = shapeWidth;
    let adjustedHeight = shapeHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (shapeAspectRatio > boxAspectRatio) {
      // Shape is wider than the box, adjust height and center vertically
      adjustedHeight = shapeWidth / shapeAspectRatio;
      offsetY = (shapeHeight - adjustedHeight) / 2;
    } else {
      // Shape is taller than the box, adjust width and center horizontally
      adjustedWidth = shapeHeight * shapeAspectRatio;
      offsetX = (shapeWidth - adjustedWidth) / 2;
    }
    stroke(255)
    // Draw the shape with preserved aspect ratio
    /*console.log(shapeBounds)*/
    detailview.push()
    detailview.scale(1.25)
    detailview.translate(0,100)
    drawMultiPolygonWithSize(
      damShapes[damName],
      shapeBounds,
      adjustedWidth,
      adjustedHeight,
      offsetX,
      offsetY,
      5
    );
    detailview.pop()
    detailview.pop(); // Restore panel state
  //}
}


function drawMultiPolygonWithSize(multiPolygon, bounds, width, height, offsetX, offsetY, padding = 20) {
    // If bounds are not provided, calculate them from the MultiPolygon
    if (!bounds) {
      bounds = calculateBounds(multiPolygon);
    }
    
    let { minLon, maxLon, minLat, maxLat } = bounds;
    
    // Calculate scale factors
    let lonRange = maxLon - minLon;
    let latRange = maxLat - minLat;
    let availableWidth = width - 2 * padding;
    let availableHeight = height - 2 * padding;
    let xScale = availableWidth / lonRange;
    let yScale = availableHeight / latRange;
    
    // Use the smaller scale to maintain aspect ratio
    let scale = Math.min(xScale, yScale);
    
    // Helper function to convert geo coordinates to canvas coordinates
    function geoToCanvas(lon, lat) {
      // Center the shape within the available space
      let centerX = offsetX + width / 2;
      let centerY = offsetY + height / 2;
      
      let scaledWidth = lonRange * scale;
      let scaledHeight = latRange * scale;
      
      let x = centerX - scaledWidth / 2 + (lon - minLon) * scale;
      let y = centerY + scaledHeight / 2 - (lat - minLat) * scale; // Flip Y-axis
      
      return { x, y };
    }
    
    // Process each polygon in the MultiPolygon
    for (let i = 0; i < multiPolygon.coordinates.length; i++) {
      let polygon = multiPolygon.coordinates[i];
      
      // Start a new shape for each polygon
      detailview.beginShape();
      
      // Draw the outer ring (first array of coordinates)
      let outerRing = polygon[0];
      for (let j = 0; j < outerRing.length; j++) {
        let [lon, lat] = outerRing[j];
        let { x, y } = geoToCanvas(lon, lat);
        detailview.vertex(x, y);
      }
      
      // Process inner rings (holes) if any
      for (let j = 1; j < polygon.length; j++) {
        let innerRing = polygon[j];
        
        // In p5.js, holes are created using beginContour() and endContour()
        detailview.beginContour();
        
        // Note: For proper hole rendering, vertices must be in the opposite 
        // direction of the outer ring (typically counterclockwise)
        for (let k = 0; k < innerRing.length; k++) {
          let [lon, lat] = innerRing[k];
          let { x, y } = geoToCanvas(lon, lat);
          detailview.vertex(x, y);
        }
        
        detailview.endContour();
      }
      
      // End the shape
      detailview.endShape(CLOSE);
    }
  }
}
