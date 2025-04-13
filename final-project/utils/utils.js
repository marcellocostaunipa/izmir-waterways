
/*************
UTILITY FUNCTIONS
**************/

function geoToPixel(lon, lat) {
  // Convert geographic coordinates to pixel coordinates
  const padding = 40;
  const x =
    padding +
    ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) *
      (width - 2 * padding);
  // Invert y-axis since SVG has origin at top-left
  const y =
    height -
    (padding +
      ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) *
        (height - 2 * padding));
  return { x, y };
}

// Original function for drawing on the main map
function drawMultiPolygon(multiPolygon, bounds, width, height, padding = 20) {
  // If bounds are not provided, calculate them from the MultiPolygon
  if (!bounds) {
    bounds = calculateBounds(multiPolygon);
  }
  
  const { minLon, maxLon, minLat, maxLat } = bounds;
  
  // Calculate scale factors
  const lonRange = maxLon - minLon;
  const latRange = maxLat - minLat;
  const availableWidth = width - 2 * padding;
  const availableHeight = height - 2 * padding;
  const xScale = availableWidth / lonRange;
  const yScale = availableHeight / latRange;
  
  // Helper function to convert geo coordinates to canvas coordinates
  function geoToCanvas(lon, lat) {
    const x = padding + (lon - minLon) * xScale;
    const y = height - (padding + (lat - minLat) * yScale); // Flip Y-axis
    return { x, y };
  }
  
  // Process each polygon in the MultiPolygon
  for (let i = 0; i < multiPolygon.coordinates.length; i++) {
    const polygon = multiPolygon.coordinates[i];
    
    // Start a new shape for each polygon
    beginShape();
    
    // Draw the outer ring (first array of coordinates)
    const outerRing = polygon[0];
    for (let j = 0; j < outerRing.length; j++) {
      const [lon, lat] = outerRing[j];
      const { x, y } = geoToCanvas(lon, lat);
      vertex(x, y);
    }
    
    // Process inner rings (holes) if any
    for (let j = 1; j < polygon.length; j++) {
      const innerRing = polygon[j];
      
      // In p5.js, holes are created using beginContour() and endContour()
      beginContour();
      
      // Note: For proper hole rendering, vertices must be in the opposite 
      // direction of the outer ring (typically counterclockwise)
      for (let k = 0; k < innerRing.length; k++) {
        const [lon, lat] = innerRing[k];
        const { x, y } = geoToCanvas(lon, lat);
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
  
  const { minLon, maxLon, minLat, maxLat } = bounds;
  
  // Calculate scale factors
  const lonRange = maxLon - minLon;
  const latRange = maxLat - minLat;
  const availableWidth = width - 2 * padding;
  const availableHeight = height - 2 * padding;
  const xScale = availableWidth / lonRange;
  const yScale = availableHeight / latRange;
  
  // Use the smaller scale to maintain aspect ratio
  const scale = Math.min(xScale, yScale);
  
  // Helper function to convert geo coordinates to canvas coordinates
  function geoToCanvas(lon, lat) {
    // Center the shape within the available space
    const centerX = offsetX + width / 2;
    const centerY = offsetY + height / 2;
    
    const scaledWidth = lonRange * scale;
    const scaledHeight = latRange * scale;
    
    const x = centerX - scaledWidth / 2 + (lon - minLon) * scale;
    const y = centerY + scaledHeight / 2 - (lat - minLat) * scale; // Flip Y-axis
    
    return { x, y };
  }
  
  // Process each polygon in the MultiPolygon
  for (let i = 0; i < multiPolygon.coordinates.length; i++) {
    const polygon = multiPolygon.coordinates[i];
    
    // Start a new shape for each polygon
    beginShape();
    
    // Draw the outer ring (first array of coordinates)
    const outerRing = polygon[0];
    for (let j = 0; j < outerRing.length; j++) {
      const [lon, lat] = outerRing[j];
      const { x, y } = geoToCanvas(lon, lat);
      vertex(x, y);
    }
    
    // Process inner rings (holes) if any
    for (let j = 1; j < polygon.length; j++) {
      const innerRing = polygon[j];
      
      // In p5.js, holes are created using beginContour() and endContour()
      beginContour();
      
      // Note: For proper hole rendering, vertices must be in the opposite 
      // direction of the outer ring (typically counterclockwise)
      for (let k = 0; k < innerRing.length; k++) {
        const [lon, lat] = innerRing[k];
        const { x, y } = geoToCanvas(lon, lat);
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
        const [lon, lat] = coord;
        minLon = Math.min(minLon, lon);
        maxLon = Math.max(maxLon, lon);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      });
    });
  });
  
  return { minLon, maxLon, minLat, maxLat };
}