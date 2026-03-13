/* ============================================================
   SafeRoute — Dashboard Page
   ============================================================ */

import { getDashboardStats, weeklySafetyData, dangerousAreas, userReports, reportTypes } from '../data.js';

export function renderDashboard() {
  const stats = getDashboardStats();
  const container = document.getElementById('page-container');

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <h2>Safety Dashboard</h2>
        <p>Your safety overview and analytics</p>
      </div>

      <!-- Stat Cards -->
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-icon">🧭</div>
          <div class="stat-value">${stats.totalTrips}</div>
          <div class="stat-label">Total Trips</div>
          <div class="stat-change positive">↑ 2 this week</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🛡️</div>
          <div class="stat-value">${stats.avgScore}<span style="font-size:0.6em;color:var(--text-secondary);">/100</span></div>
          <div class="stat-label">Avg Safety Score</div>
          <div class="stat-change positive">↑ 5 pts vs last week</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📏</div>
          <div class="stat-value">${stats.totalDistance}<span style="font-size:0.6em;color:var(--text-secondary);"> km</span></div>
          <div class="stat-label">Total Distance</div>
          <div class="stat-change positive">↑ 12.4 km</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⚠️</div>
          <div class="stat-value">${stats.totalReports}</div>
          <div class="stat-label">Reports Submitted</div>
          <div class="stat-change positive">↑ 1 new</div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid-2" style="margin-top: var(--space-xl);">

        <!-- Weekly Safety Chart -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Weekly Safety Trend</h3>
            <span style="font-size:var(--fs-sm);color:var(--text-muted);">Last 7 days</span>
          </div>
          <div class="bar-chart">
            ${weeklySafetyData.map(d => {
              const height = d.score;
              const color = d.score >= 80 ? '#10b981' : d.score >= 60 ? '#f59e0b' : '#ef4444';
              return `
                <div class="bar-wrapper">
                  <div class="bar-value">${d.score}</div>
                  <div class="bar" style="height:${height}%;background:${color};"></div>
                  <div class="bar-label">${d.day}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Top Dangerous Areas -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">⚠️ Highest Risk Areas</h3>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px;">
            ${dangerousAreas.map((area, i) => {
              const safetyDisplay = 100 - area.score;
              const rating = safetyDisplay <= 40 ? { color: '#ef4444', label: 'Dangerous' }
                : safetyDisplay <= 60 ? { color: '#f97316', label: 'Poor' }
                : { color: '#f59e0b', label: 'Moderate' };
              return `
                <div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--glass);border-radius:var(--radius-sm);">
                  <span style="width:24px;text-align:center;font-weight:700;color:var(--text-muted);">#${i + 1}</span>
                  <div style="flex:1;">
                    <div style="font-weight:600;font-size:var(--fs-sm);">${area.name}</div>
                    <div style="font-size:var(--fs-xs);color:var(--text-muted);">${area.accidents} accidents</div>
                  </div>
                  <span style="color:${rating.color};font-weight:600;font-size:var(--fs-sm);">${safetyDisplay}/100</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card" style="margin-top: var(--space-xl);">
        <div class="card-header">
          <h3 class="card-title">Recent Activity</h3>
        </div>
        <div class="activity-feed">
          ${userReports.slice(0, 4).map(report => {
            const config = reportTypes[report.type] || reportTypes.other;
            const time = timeAgo(report.createdAt);
            return `
              <div class="activity-item">
                <div class="activity-icon">${config.icon}</div>
                <div class="activity-content">
                  <div><strong>${config.label}</strong> reported</div>
                  <div style="font-size:var(--fs-sm);color:var(--text-secondary);">${report.description}</div>
                  <div class="activity-time">${time} • 👍 ${report.upvotes}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);

  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
