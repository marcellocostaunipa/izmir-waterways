
/*************
UTILITY FUNCTIONS
**************/



function geoToPixel(lon, lat) {
  // Convert geographic coordinates to pixel coordinates
  let padding = 40;
  
  // Map longitude to x-coordinate with padding
  let x = map(
    lon,
    bounds.minLon, bounds.maxLon,
    padding, (width-(width-height))/1.15 - padding
  );
  
  // Map latitude to y-coordinate with padding
  // Note: We invert the target range to flip the y-axis
  let y = map(
    lat,
    bounds.minLat, bounds.maxLat,
    height/1.15 - padding, padding
  );
  
  return { x, y };
}

// Original function for drawing on the main map
function drawMultiPolygon(multiPolygon, bounds, width, height, padding = 20) {
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
  
  // Helper function to convert geo coordinates to canvas coordinates
  function geoToCanvas(lon, lat) {
    let x = padding + (lon - minLon) * xScale;
    let y = height - (padding + (lat - minLat) * yScale); // Flip Y-axis
    return { x, y };
  }
  
  // Process each polygon in the MultiPolygon
  for (let i = 0; i < multiPolygon.coordinates.length; i++) {
    let polygon = multiPolygon.coordinates[i];
    
    // Start a new shape for each polygon
    beginShape();
    
    // Draw the outer ring (first array of coordinates)
    let outerRing = polygon[0];
    for (let j = 0; j < outerRing.length; j++) {
      let [lon, lat] = outerRing[j];
      let { x, y } = geoToCanvas(lon, lat);
      vertex(x, y);
    }
    
    // Process inner rings (holes) if any
    for (let j = 1; j < polygon.length; j++) {
      let innerRing = polygon[j];
      
      // In p5.js, holes are created using beginContour() and endContour()
      beginContour();
      
      // Note: For proper hole rendering, vertices must be in the opposite 
      // direction of the outer ring (typically counterclockwise)
      for (let k = 0; k < innerRing.length; k++) {
        let [lon, lat] = innerRing[k];
        let { x, y } = geoToCanvas(lon, lat);
        vertex(x, y);
      }
      
      endContour();
    }
    
    // End the shape
    endShape(CLOSE);
  }
}

// New function for drawing with preserved aspect ratio in the details panel
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
    beginShape();
    
    // Draw the outer ring (first array of coordinates)
    let outerRing = polygon[0];
    for (let j = 0; j < outerRing.length; j++) {
      let [lon, lat] = outerRing[j];
      let { x, y } = geoToCanvas(lon, lat);
      vertex(x, y);
    }
    
    // Process inner rings (holes) if any
    for (let j = 1; j < polygon.length; j++) {
      let innerRing = polygon[j];
      
      // In p5.js, holes are created using beginContour() and endContour()
      beginContour();
      
      // Note: For proper hole rendering, vertices must be in the opposite 
      // direction of the outer ring (typically counterclockwise)
      for (let k = 0; k < innerRing.length; k++) {
        let [lon, lat] = innerRing[k];
        let { x, y } = geoToCanvas(lon, lat);
        vertex(x, y);
      }
      
      endContour();
    }
    
    // End the shape
    endShape(CLOSE);
  }
}

function calculateBounds(multiPolygon) {
  let minLon = Infinity, maxLon = -Infinity;
  let minLat = Infinity, maxLat = -Infinity;
  
  // Iterate through all polygons
  multiPolygon.coordinates.forEach(polygon => {
    // Each polygon has an outer ring and possibly inner rings
    polygon.forEach(ring => {
      ring.forEach(coord => {
        let [lon, lat] = coord;
        minLon = Math.min(minLon, lon);
        maxLon = Math.max(maxLon, lon);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      });
    });
  });
  
  return { minLon, maxLon, minLat, maxLat };
}