/* ============================================================
   SafeRoute — Home Page (Map View)
   ============================================================ */

import { initMap, toggleHeatmap, toggleAccidentMarkers, calculateRoute, clearAll, resizeMap, resolveLocation, setOrigin, setDestination } from '../map.js';
import { popularLocations } from '../data.js';

export function renderHome() {
  const container = document.getElementById('page-container');
  container.innerHTML = `
    <div id="map-container">
      <div id="map"></div>

      <!-- Route Planning Panel -->
      <div class="route-panel">
        <div class="route-panel-header">
          <h3>🧭 Plan Your Route</h3>
          <div class="route-inputs">
            <div class="route-input-wrapper">
              <div class="route-dot origin"></div>
              <input type="text" id="origin-input" placeholder="Click map or type: Koramangala" list="locations-list" />
            </div>
            <div class="route-input-wrapper">
              <div class="route-dot destination"></div>
              <input type="text" id="dest-input" placeholder="Click map or type: Whitefield" list="locations-list" />
            </div>
          </div>
          <datalist id="locations-list">
            ${popularLocations.map(l => `<option value="${l.name}">`).join('')}
          </datalist>
        </div>
        <div class="route-panel-actions">
          <button class="btn btn-primary" id="find-route-btn" style="flex:1;">🔍 Find Routes</button>
          <button class="btn btn-ghost btn-sm" id="clear-route-btn">Clear</button>
        </div>
        <div id="route-results" class="route-results hidden"></div>
      </div>

      <!-- Map Controls (right side) -->
      <div class="map-controls">
        <button class="map-control-btn" id="heatmap-toggle-btn" title="Toggle Accident Heatmap">🔥</button>
        <button class="map-control-btn" id="accidents-toggle-btn" title="Toggle Accident Markers">💥</button>
        <button class="map-control-btn" id="center-map-btn" title="Center Map">📍</button>
      </div>

      <!-- Legend -->
      <div class="map-legend" id="map-legend" style="display:none;">
        <div class="legend-title">Accident Severity</div>
        <div class="legend-item"><div class="legend-color" style="background:#f59e0b;"></div> Minor</div>
        <div class="legend-item"><div class="legend-color" style="background:#f97316;"></div> Moderate</div>
        <div class="legend-item"><div class="legend-color" style="background:#ef4444;"></div> Severe</div>
        <div class="legend-item"><div class="legend-color" style="background:#dc2626;"></div> Fatal</div>
      </div>
    </div>
  `;

  // Make map container full height
  const mapContainer = document.getElementById('map-container');
  mapContainer.style.height = `calc(100vh - var(--topbar-height))`;

  // Initialize map
  setTimeout(() => {
    initMap('map');
    resizeMap();
  }, 50);

  // ---- Event Listeners ----

  document.getElementById('find-route-btn').addEventListener('click', () => {
    const originInput = document.getElementById('origin-input').value.trim();
    const destInput = document.getElementById('dest-input').value.trim();

    // Resolve typed locations
    if (originInput) {
      const loc = resolveLocation(originInput);
      if (loc) setOrigin(loc.lat, loc.lng);
    }
    if (destInput) {
      const loc = resolveLocation(destInput);
      if (loc) setDestination(loc.lat, loc.lng);
    }

    const resultsDiv = document.getElementById('route-results');
    resultsDiv.classList.remove('hidden');
    resultsDiv.innerHTML = '<p style="text-align:center;padding:16px;color:var(--text-secondary);">Calculating routes...</p>';

    calculateRoute((result, error) => {
      if (error) {
        resultsDiv.innerHTML = `<p style="padding:12px;color:var(--warning);font-size:13px;">${error}</p>`;
        return;
      }
      if (!result) {
        resultsDiv.innerHTML = '<p style="padding:12px;color:var(--danger);font-size:13px;">Failed to calculate route.</p>';
        return;
      }
      renderRouteResults(result);
    });
  });

  document.getElementById('clear-route-btn').addEventListener('click', () => {
    clearAll();
    document.getElementById('origin-input').value = '';
    document.getElementById('dest-input').value = '';
    document.getElementById('route-results').classList.add('hidden');
  });

  document.getElementById('heatmap-toggle-btn').addEventListener('click', (e) => {
    const active = toggleHeatmap();
    e.currentTarget.classList.toggle('active', active);
  });

  document.getElementById('accidents-toggle-btn').addEventListener('click', (e) => {
    const active = toggleAccidentMarkers();
    e.currentTarget.classList.toggle('active', active);
    document.getElementById('map-legend').style.display = active ? 'block' : 'none';
  });

  document.getElementById('center-map-btn').addEventListener('click', () => {
    const m = (window.__safeRouteMap || null);
    if (m) m.setView([28.4595, 77.0266], 12);
    else {
      const mapInst = initMap('map');
      mapInst.setView([28.4595, 77.0266], 12);
    }
  });
}

function renderRouteResults(result) {
  const div = document.getElementById('route-results');
  const s = result.safest;
  const f = result.fastest;

  div.innerHTML = `
    <div class="route-option selected" data-route="safest">
      <div class="route-option-header">
        <span class="route-option-title">
          🛡️ Safest Route
          <span class="route-badge badge-safe">Recommended</span>
        </span>
      </div>
      <div class="route-option-stats">
        <span class="route-stat">📏 ${s.distance} km</span>
        <span class="route-stat">⏱️ ${s.duration} min</span>
        <span class="route-stat" style="color:${s.rating.color};font-weight:600;">🛡️ ${s.safetyScore}/100</span>
      </div>
      <div class="safety-score-bar">
        <div class="safety-score-fill ${s.rating.class}" style="width:${s.safetyScore}%;"></div>
      </div>
    </div>

    <div class="route-option" data-route="fastest">
      <div class="route-option-header">
        <span class="route-option-title">
          ⚡ Fastest Route
          <span class="route-badge badge-fast">-${s.duration - f.duration} min</span>
        </span>
      </div>
      <div class="route-option-stats">
        <span class="route-stat">📏 ${f.distance} km</span>
        <span class="route-stat">⏱️ ${f.duration} min</span>
        <span class="route-stat" style="color:${f.rating.color};font-weight:600;">🛡️ ${f.safetyScore}/100</span>
      </div>
      <div class="safety-score-bar">
        <div class="safety-score-fill ${f.rating.class}" style="width:${f.safetyScore}%;"></div>
      </div>
    </div>

    <div style="padding:8px 0;text-align:center;">
      <span style="font-size:12px;color:var(--success);font-weight:600;">
        ✅ Safest route is ${s.safetyScore - f.safetyScore} points safer
      </span>
    </div>
  `;
}
