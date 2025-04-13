# Izmir Water Resources Visualization

An interactive visualization of water resources in the Izmir province of Turkey, presented using fullPage.js for a full-screen, section-based experience.

## Features

- Interactive map of Izmir province showing dams and water resources
- Click on dams to view detailed information
- Responsive design that works on various screen sizes
- Full-screen scrolling interface using fullPage.js

## Setup

1. Clone this repository
2. Make sure you have the following files:
   - `index.html` - Main HTML file with fullPage.js integration
   - `sketch.js` - Main p5.js sketch
   - `utils/utils.js` - Utility functions for geographic calculations
   - `izsu.json` - Data about dams in Izmir
   - `izmir.json` - Geographic boundary data for Izmir province
   - `dams/balcovaData.json` - Shape data for Balçova Dam

3. Open `index.html` in a web server (local or online)

## Dependencies

- [p5.js](https://p5js.org/) - JavaScript library for creative coding
- [fullPage.js](https://alvarotrigo.com/fullPage/) - JavaScript library for full-screen scrolling websites

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Created as part of the 2025 Waterways Workshop
- Geographic data sourced from public records
