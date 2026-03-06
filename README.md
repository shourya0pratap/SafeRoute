<p align="center">
  <img src="public/favicon.svg" alt="SafeRoute Logo" width="80" />
</p>

<h1 align="center">SafeRoute</h1>

<p align="center">
  <strong>Navigate Safer, Not Just Faster.</strong>
</p>

<p align="center">
  A safety-first navigation platform that prioritizes your well-being by factoring accident data, road conditions, weather, lighting, and community reports into every route.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#safety-scoring">Safety Scoring</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

---

## Overview

SafeRoute reimagines navigation by placing **safety at the core** of route planning. Instead of optimizing solely for speed, SafeRoute evaluates multiple risk factors — accident history, traffic density, road conditions, street lighting, and real-time weather — to recommend the safest path to your destination.

Currently targeting **Gurugram, Haryana, India**, with an extensible architecture designed for broader regional support.

---

## Features

### 🗺️ Interactive Map & Route Planning
- **Dual Route Comparison** — view the **Safest Route** and the **Fastest Route** side-by-side with safety scores
- **Accident Heatmap** — toggle a severity-weighted density overlay to visualize danger zones
- **Accident Markers** — inspect individual accident records with severity, date, vehicle count, and casualty data
- **Click-to-Select** — tap anywhere on the map or search from 22+ predefined locations to set origin/destination

### 📊 Dashboard & Analytics
- **At-a-Glance Stats** — total trips, average safety score, distance traveled, reports submitted
- **Weekly Safety Trend** — bar chart tracking day-by-day safety performance
- **Top 5 Dangerous Areas** — ranked risk zones with accident counts
- **Recent Activity Feed** — live stream of community hazard reports

### 🧭 Trip History
- Complete log of past trips with origin, destination, distance, duration, and safety score
- Filter by route mode: safest, fastest, or balanced

### ⚠️ Community Hazard Reporting
- Report 6 hazard types: **Pothole · Broken Light · Flooding · Accident · Road Damage · Other**
- Optional photo upload
- Upvote system and verification status for community-submitted reports
- Reports automatically appear as markers on the map

### 👤 Profile & Preferences
- Manage emergency contacts
- Adjustable **Safety Priority Slider** (speed ↔ safety)
- Night Mode, Voice Alerts, Push Notifications, Avoid Highways toggles

### 🌙 Dark & Light Themes
- Glassmorphism UI with frosted-glass effects
- Dark mode (default) with animated background shapes
- Seamless theme switching with matching map tile layers (CARTO Dark / Light)

---

## Tech Stack

| Layer        | Technology                                               |
|-------------|----------------------------------------------------------|
| **Bundler**  | [Vite](https://vitejs.dev/) 5.4                         |
| **Maps**     | [Leaflet](https://leafletjs.com/) 1.9 + Leaflet Routing Machine 3.2 |
| **Routing**  | [OSRM](http://project-osrm.org/) (Open Source Routing Machine) |
| **Heatmap**  | [Leaflet.heat](https://github.com/Leaflet/Leaflet.heat) |
| **Tiles**    | [CARTO](https://carto.com/) Dark / Light basemaps       |
| **Styling**  | Custom CSS with CSS Custom Properties, Google Fonts (Inter) |
| **Storage**  | LocalStorage for user data and theme persistence         |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 16
- npm (included with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/shourya0pratap/SafeRoute.git
cd SafeRoute

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

---

## Project Structure

```
saferoute-app/
├── index.html              # Entry HTML with app shell
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── public/
│   └── favicon.svg         # App icon
└── src/
    ├── main.js             # App bootstrap, routing, auth, theme management
    ├── map.js              # Leaflet map instance, markers, heatmap, routing
    ├── scoring.js          # Multi-factor safety scoring engine
    ├── data.js             # Mock datasets (accidents, reports, trips, locations)
    ├── styles.css          # Global styles, glassmorphism theme, animations
    └── pages/
        ├── home.js         # Map view with route planning panel
        ├── dashboard.js    # Analytics dashboard with stats and charts
        ├── trips.js        # Trip history log
        ├── report.js       # Community hazard reporting form
        └── profile.js      # User profile and settings
```

---

## Safety Scoring

SafeRoute uses a **multi-factor weighted scoring engine** that produces a safety rating from **0 (safest) to 100 (most dangerous)**.

### Scoring Factors

| Factor             | Day Weight | Night Weight |
|--------------------|-----------|--------------|
| Accident Density   | 40%       | 30%          |
| Traffic Density    | 20%       | 10%          |
| Road Condition     | 20%       | 15%          |
| Street Lighting    | 10%       | **30%**      |
| Weather Risk       | 10%       | 15%          |

> Street lighting importance **triples at night**, reflecting the elevated risk of poorly lit roads after dark.

### Accident Severity Weighting

| Severity | Multiplier |
|----------|-----------|
| Minor    | 1×        |
| Moderate | 3×        |
| Severe   | 7×        |
| Fatal    | 10×       |

### Safety Ratings

| Score   | Rating      | Color   |
|---------|-------------|---------|
| 0–20    | Excellent   | 🟢 Green  |
| 21–40   | Good        | 🟢 Lime   |
| 41–60   | Moderate    | 🟡 Amber  |
| 61–80   | Poor        | 🟠 Orange |
| 81–100  | Dangerous   | 🔴 Red    |

---

## Screenshots

> *Coming soon — add screenshots of the map view, dashboard, and hazard reporting pages here.*

---

## Contributing

Contributions are welcome! To get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/your-feature`)
3. **Commit** your changes (`git commit -m "feat: add your feature"`)
4. **Push** to the branch (`git push origin feature/your-feature`)
5. **Open** a Pull Request

Please ensure your code follows the existing project style and structure.

<!-- ---

## License

This project is open source. See the repository for license details.
