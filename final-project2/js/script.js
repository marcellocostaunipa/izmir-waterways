document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('container');
    const colIndicators = document.querySelectorAll('#colIndicators .indicator');
    const rowIndicators = document.querySelectorAll('#rowIndicators .indicator');
    const slideInfo = document.getElementById('slideInfo');
    
    let currentRow = 0;
    let currentCol = 0;
    const numCols = 3;
    
    // Handle indicator clicks
    colIndicators.forEach(indicator => {
      indicator.addEventListener('click', function() {
        const col = parseInt(this.getAttribute('data-col'));
        scrollToSlide(currentRow, col);
      });
    });
    
    rowIndicators.forEach(indicator => {
      indicator.addEventListener('click', function() {
        const row = parseInt(this.getAttribute('data-row'));
        scrollToSlide(row, currentCol);
      });
    });
    
    // Function to scroll to a specific slide
    function scrollToSlide(row, col) {
      const slideIndex = row * numCols + col;
      const slides = document.querySelectorAll('.slide');
      
      if (slideIndex >= 0 && slideIndex < slides.length) {
        slides[slideIndex].scrollIntoView({ behavior: 'smooth' });
        updateIndicators(row, col);
      }
    }
    
    // Function to update indicators
    function updateIndicators(row, col) {
      currentRow = row;
      currentCol = col;
      
      // Update column indicators
      colIndicators.forEach(indicator => {
        const indicatorCol = parseInt(indicator.getAttribute('data-col'));
        if (indicatorCol === col) {
          indicator.classList.add('active');
        } else {
          indicator.classList.remove('active');
        }
      });
      
      // Update row indicators
      rowIndicators.forEach(indicator => {
        const indicatorRow = parseInt(indicator.getAttribute('data-row'));
        if (indicatorRow === row) {
          indicator.classList.add('active');
        } else {
          indicator.classList.remove('active');
        }
      });
      
      // Update slide info
      slideInfo.textContent = `Slide ${row * numCols + col + 1} (Row ${row + 1}, Col ${col + 1})`;
    }
    
    // Detect which slide is in view on scroll
    container.addEventListener('scroll', function() {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      const scrollLeft = container.scrollLeft;
      const scrollTop = container.scrollTop;
      
      const col = Math.round(scrollLeft / containerWidth);
      const row = Math.round(scrollTop / containerHeight);
      
      if (row !== currentRow || col !== currentCol) {
        updateIndicators(row, col);
      }
    });
  });