/* ============================================================
   SafeRoute — Trip History Page
   ============================================================ */

import { trips } from '../data.js';
import { getSafetyRating, displayScore } from '../scoring.js';

export function renderTrips() {
  const container = document.getElementById('page-container');

  const totalTrips = trips.length;
  const avgScore = Math.round(trips.reduce((s, t) => s + t.safetyScore, 0) / totalTrips);
  const totalDist = trips.reduce((s, t) => s + t.distance, 0).toFixed(1);
  const safestTrip = trips.reduce((best, t) => t.safetyScore > best.safetyScore ? t : best, trips[0]);

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <h2>Trip History</h2>
        <p>Your past trips and safety scores</p>
      </div>

      <!-- Summary Cards -->
      <div class="stat-grid" style="margin-bottom:var(--space-xl);">
        <div class="stat-card">
          <div class="stat-icon">🧭</div>
          <div class="stat-value">${totalTrips}</div>
          <div class="stat-label">Total Trips</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🛡️</div>
          <div class="stat-value">${avgScore}</div>
          <div class="stat-label">Avg Safety Score</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📏</div>
          <div class="stat-value">${totalDist} km</div>
          <div class="stat-label">Total Distance</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-value">${safestTrip.safetyScore}</div>
          <div class="stat-label">Best Score</div>
        </div>
      </div>

      <!-- Trip List -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">All Trips</h3>
          <span style="font-size:var(--fs-sm);color:var(--text-muted);">${totalTrips} trips</span>
        </div>
        <div class="trip-list">
          ${trips.map(trip => {
            const rating = getSafetyRating(100 - trip.safetyScore);
            const modeIcons = { safest: '🛡️', fastest: '⚡', balanced: '⚖️' };
            return `
              <div class="trip-card">
                <div class="trip-icon">${modeIcons[trip.mode] || '🧭'}</div>
                <div class="trip-info">
                  <div class="trip-route">${trip.origin} → ${trip.destination}</div>
                  <div class="trip-meta">
                    <span>📏 ${trip.distance} km</span>
                    <span>⏱️ ${trip.duration} min</span>
                    <span>📅 ${formatDate(trip.date)}</span>
                    <span style="text-transform:capitalize;">${trip.mode}</span>
                  </div>
                </div>
                <div class="trip-score">
                  <div class="score-value" style="color:${rating.color};">${trip.safetyScore}</div>
                  <div class="score-label">Safety</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
