/* ============================================================
   SafeRoute — Map Module
   Leaflet map with routing, heatmap, and hazard markers
   ============================================================ */

import { getHeatmapData, userReports, reportTypes, accidents, popularLocations } from './data.js';
import { calculateRouteScore, displayScore, getSafetyRating, calculateSafetyScore } from './scoring.js';

let map = null;
let heatLayer = null;
let reportMarkers = [];
let routingControl = null;
let originMarker = null;
let destMarker = null;
let routePolylines = [];
let heatmapVisible = false;
let accidentMarkersVisible = false;
let accidentMarkers = [];

const GURUGRAM_CENTER = [28.4595, 77.0266];

// ---- Dark & Light Tile Layers ----
const darkTiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const lightTiles = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const tileAttribution = '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>';

let currentTileLayer = null;

/**
 * Initialize the Leaflet map
 */
export function initMap(containerId = 'map') {
  if (map) {
    map.invalidateSize();
    return map;
  }

  map = L.map(containerId, {
    center: GURUGRAM_CENTER,
    zoom: 12,
    zoomControl: true,
    attributionControl: true,
  });

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  currentTileLayer = L.tileLayer(isDark ? darkTiles : lightTiles, {
    attribution: tileAttribution,
    maxZoom: 19,
  }).addTo(map);

  // Add user report markers
  addReportMarkers();

  // Map click handler for setting origin/destination
  map.on('click', handleMapClick);

  return map;
}

/**
 * Update tile layer when theme changes
 */
export function updateMapTheme(isDark) {
  if (!map || !currentTileLayer) return;
  map.removeLayer(currentTileLayer);
  currentTileLayer = L.tileLayer(isDark ? darkTiles : lightTiles, {
    attribution: tileAttribution,
    maxZoom: 19,
  }).addTo(map);
}

/**
 * Resize map (call when container size changes)
 */
export function resizeMap() {
  if (map) {
    setTimeout(() => map.invalidateSize(), 100);
  }
}

/**
 * Destroy the map instance
 */
export function destroyMap() {
  if (map) {
    map.remove();
    map = null;
    currentTileLayer = null;
    heatLayer = null;
    reportMarkers = [];
    routePolylines = [];
    accidentMarkers = [];
  }
}

// ---- HEATMAP ----

export function toggleHeatmap() {
  if (!map) return false;

  if (heatmapVisible) {
    if (heatLayer) {
      map.removeLayer(heatLayer);
      heatLayer = null;
    }
    heatmapVisible = false;
  } else {
    const data = getHeatmapData();
    heatLayer = L.heatLayer(data, {
      radius: 35,
      blur: 25,
      maxZoom: 15,
      max: 1.0,
      gradient: {
        0.2: '#22d3ee',
        0.4: '#84cc16',
        0.6: '#f59e0b',
        0.8: '#f97316',
        1.0: '#ef4444',
      },
    }).addTo(map);
    heatmapVisible = true;
  }

  return heatmapVisible;
}

// ---- ACCIDENT MARKERS ----

export function toggleAccidentMarkers() {
  if (!map) return false;

  if (accidentMarkersVisible) {
    accidentMarkers.forEach(m => map.removeLayer(m));
    accidentMarkers = [];
    accidentMarkersVisible = false;
  } else {
    const severityColor = { minor: '#f59e0b', moderate: '#f97316', severe: '#ef4444', fatal: '#dc2626' };

    accidents.forEach(a => {
      const color = severityColor[a.severity] || '#ef4444';
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 8px ${color}80;"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const marker = L.marker([a.lat, a.lng], { icon }).addTo(map);
      marker.bindPopup(`
        <div style="min-width:200px;">
          <strong style="font-size:14px;">${a.name}</strong><br/>
          <span style="color:${color};font-weight:600;text-transform:uppercase;font-size:11px;">${a.severity}</span><br/>
          <span style="font-size:12px;opacity:0.7;">${a.date}</span><br/>
          <div style="margin-top:6px;font-size:12px;">
            🚗 ${a.vehicles} vehicles &nbsp; 🤕 ${a.injuries} injuries &nbsp; 💀 ${a.fatalities} fatalities
          </div>
        </div>
      `);
      accidentMarkers.push(marker);
    });
    accidentMarkersVisible = true;
  }

  return accidentMarkersVisible;
}

// ---- REPORT MARKERS ----

function addReportMarkers() {
  userReports.forEach(report => {
    const config = reportTypes[report.type] || reportTypes.other;
    const icon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="width:30px;height:30px;border-radius:8px;background:${config.color}20;border:2px solid ${config.color};display:flex;align-items:center;justify-content:center;font-size:16px;">${config.icon}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    const marker = L.marker([report.lat, report.lng], { icon }).addTo(map);
    marker.bindPopup(`
      <div style="min-width:200px;">
        <strong>${config.icon} ${config.label}</strong><br/>
        <span style="font-size:12px;">${report.description}</span><br/>
        <div style="margin-top:6px;display:flex;gap:12px;font-size:11px;opacity:0.7;">
          <span>👍 ${report.upvotes} upvotes</span>
          <span>Status: ${report.status}</span>
        </div>
      </div>
    `);
    reportMarkers.push(marker);
  });
}

/**
 * Add a new report marker to the map
 */
export function addNewReportMarker(report) {
  if (!map) return;
  const config = reportTypes[report.type] || reportTypes.other;
  const icon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:30px;height:30px;border-radius:8px;background:${config.color}20;border:2px solid ${config.color};display:flex;align-items:center;justify-content:center;font-size:16px;">${config.icon}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
  const marker = L.marker([report.lat, report.lng], { icon }).addTo(map);
  marker.bindPopup(`<strong>${config.icon} ${config.label}</strong><br/>${report.description}`);
  reportMarkers.push(marker);
}

// ---- MAP CLICK → SET ORIGIN/DESTINATION ----

let clickMode = 'origin'; // 'origin' | 'destination'
let originLatLng = null;
let destLatLng = null;

export function setClickMode(mode) { clickMode = mode; }

function handleMapClick(e) {
  const { lat, lng } = e.latlng;

  if (clickMode === 'origin') {
    setOrigin(lat, lng);
    clickMode = 'destination';
  } else {
    setDestination(lat, lng);
    clickMode = 'origin';
  }
}

export function setOrigin(lat, lng) {
  originLatLng = [lat, lng];
  if (originMarker) map.removeLayer(originMarker);

  const icon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:16px;height:16px;border-radius:50%;background:#10b981;border:3px solid white;box-shadow:0 0 10px #10b98180;"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
  originMarker = L.marker([lat, lng], { icon }).addTo(map);
  originMarker.bindPopup('📍 Origin').openPopup();

  // Update input field
  const input = document.getElementById('origin-input');
  if (input) {
    const loc = findNearestLocation(lat, lng);
    input.value = loc ? loc.name : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

export function setDestination(lat, lng) {
  destLatLng = [lat, lng];
  if (destMarker) map.removeLayer(destMarker);

  const icon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:16px;height:16px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 0 10px #ef444480;"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
  destMarker = L.marker([lat, lng], { icon }).addTo(map);
  destMarker.bindPopup('🏁 Destination').openPopup();

  const input = document.getElementById('dest-input');
  if (input) {
    const loc = findNearestLocation(lat, lng);
    input.value = loc ? loc.name : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

function findNearestLocation(lat, lng) {
  let nearest = null;
  let minDist = Infinity;
  popularLocations.forEach(loc => {
    const d = Math.sqrt((lat - loc.lat) ** 2 + (lng - loc.lng) ** 2);
    if (d < minDist && d < 0.02) {
      minDist = d;
      nearest = loc;
    }
  });
  return nearest;
}

// ---- ROUTE CALCULATION ----

export function calculateRoute(onResult) {
  if (!originLatLng || !destLatLng) {
    if (onResult) onResult(null, 'Please set both origin and destination by clicking on the map.');
    return;
  }

  // Clear previous routes
  clearRoutes();

  try {
    // Use OSRM demo server for routing
    routingControl = L.Routing.control({
      waypoints: [
        L.latLng(originLatLng[0], originLatLng[1]),
        L.latLng(destLatLng[0], destLatLng[1]),
      ],
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
      }),
      lineOptions: {
        styles: [{ color: '#06b6d4', weight: 5, opacity: 0.8 }],
        addWaypoints: false,
      },
      show: false,
      addWaypoints: false,
      fitSelectedRoutes: true,
      createMarker: () => null, // Don't add default markers
    }).addTo(map);

    routingControl.on('routesfound', (e) => {
      const route = e.routes[0];
      const waypoints = route.coordinates.map(c => [c.lat, c.lng]);
      const safetyResult = calculateRouteScore(waypoints);

      const distKm = (route.summary.totalDistance / 1000).toFixed(1);
      const durationMin = Math.round(route.summary.totalTime / 60);

      // Build a "fastest" comparison (same route but different score)
      const fastestScore = Math.min(100, safetyResult.overall + 15 + Math.floor(Math.random() * 10));
      const fastestDuration = Math.max(10, durationMin - 5 - Math.floor(Math.random() * 8));

      const result = {
        safest: {
          distance: distKm,
          duration: durationMin,
          safetyScore: displayScore(safetyResult.overall),
          rawScore: safetyResult.overall,
          rating: safetyResult.safetyRating,
        },
        fastest: {
          distance: (parseFloat(distKm) - 1 - Math.random() * 2).toFixed(1),
          duration: fastestDuration,
          safetyScore: displayScore(fastestScore),
          rawScore: fastestScore,
          rating: getSafetyRating(fastestScore),
        },
      };

      if (onResult) onResult(result, null);
    });

    routingControl.on('routingerror', () => {
      // Fallback: draw a straight line
      drawFallbackRoute();
      if (onResult) {
        const score = calculateSafetyScore(
          (originLatLng[0] + destLatLng[0]) / 2,
          (originLatLng[1] + destLatLng[1]) / 2
        );
        const dist = haversineDistance(originLatLng, destLatLng);
        const result = {
          safest: {
            distance: dist.toFixed(1),
            duration: Math.round(dist * 3),
            safetyScore: displayScore(score.overall),
            rawScore: score.overall,
            rating: getSafetyRating(score.overall),
          },
          fastest: {
            distance: (dist * 0.9).toFixed(1),
            duration: Math.round(dist * 2.5),
            safetyScore: displayScore(Math.min(100, score.overall + 15)),
            rawScore: Math.min(100, score.overall + 15),
            rating: getSafetyRating(Math.min(100, score.overall + 15)),
          },
        };
        onResult(result, null);
      }
    });
  } catch (err) {
    drawFallbackRoute();
    if (onResult) onResult(null, 'Routing service unavailable. Showing direct path.');
  }
}

function drawFallbackRoute() {
  if (!originLatLng || !destLatLng) return;
  const polyline = L.polyline([originLatLng, destLatLng], {
    color: '#06b6d4',
    weight: 4,
    opacity: 0.7,
    dashArray: '10, 10',
  }).addTo(map);
  routePolylines.push(polyline);
  map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
}

function haversineDistance(p1, p2) {
  const R = 6371;
  const dLat = (p2[0] - p1[0]) * Math.PI / 180;
  const dLng = (p2[1] - p1[1]) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(p1[0] * Math.PI / 180) * Math.cos(p2[0] * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function clearRoutes() {
  if (routingControl && map) {
    map.removeControl(routingControl);
    routingControl = null;
  }
  routePolylines.forEach(p => { if (map) map.removeLayer(p); });
  routePolylines = [];
}

export function clearAll() {
  clearRoutes();
  if (originMarker && map) map.removeLayer(originMarker);
  if (destMarker && map) map.removeLayer(destMarker);
  originMarker = null;
  destMarker = null;
  originLatLng = null;
  destLatLng = null;
  clickMode = 'origin';
}

export function getMapInstance() { return map; }

/**
 * Resolve a location name to coordinates
 */
export function resolveLocation(name) {
  const lower = name.toLowerCase().trim();
  return popularLocations.find(l => l.name.toLowerCase() === lower) || null;
}
