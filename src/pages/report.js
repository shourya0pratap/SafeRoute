/* ============================================================
   SafeRoute — Report Hazard Page
   ============================================================ */

import { reportTypes, userReports } from '../data.js';
import { addNewReportMarker } from '../map.js';

let selectedType = null;

export function renderReport() {
  const container = document.getElementById('page-container');

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <h2>Report a Hazard</h2>
        <p>Help the community by reporting road hazards</p>
      </div>

      <div class="grid-2">
        <!-- Report Form -->
        <div class="card">
          <h3 class="card-title" style="margin-bottom:var(--space-lg);">New Report</h3>

          <label style="font-size:var(--fs-sm);font-weight:500;color:var(--text-secondary);display:block;margin-bottom:var(--space-sm);">Hazard Type</label>
          <div class="hazard-type-grid" id="hazard-type-grid">
            ${Object.entries(reportTypes).map(([key, cfg]) => `
              <button class="hazard-type-btn" data-type="${key}">
                <span class="hazard-icon">${cfg.icon}</span>
                <span>${cfg.label}</span>
              </button>
            `).join('')}
          </div>

          <div class="input-group">
            <label for="report-location">Location</label>
            <input type="text" id="report-location" placeholder="e.g., MG Road near Trinity Circle" />
          </div>

          <div class="input-group">
            <label for="report-description">Description</label>
            <textarea id="report-description" placeholder="Describe the hazard in detail..."></textarea>
          </div>

          <div class="input-group">
            <label>Photo (optional)</label>
            <div style="border:2px dashed var(--glass-border);border-radius:var(--radius-md);padding:var(--space-xl);text-align:center;cursor:pointer;transition:all 0.25s;" id="photo-upload">
              <div style="font-size:2rem;margin-bottom:var(--space-sm);">📷</div>
              <div style="color:var(--text-secondary);font-size:var(--fs-sm);">Click to upload a photo</div>
              <div id="photo-name" style="color:var(--accent);font-size:var(--fs-sm);margin-top:4px;"></div>
            </div>
          </div>

          <button class="btn btn-primary btn-full" id="submit-report-btn">
            📤 Submit Report
          </button>
        </div>

        <!-- Recent Reports -->
        <div class="card">
          <h3 class="card-title" style="margin-bottom:var(--space-lg);">Recent Reports</h3>
          <div class="reports-list" id="reports-list">
            ${userReports.map(report => {
              const cfg = reportTypes[report.type] || reportTypes.other;
              return `
                <div class="report-item">
                  <div class="report-type-icon ${report.type}">${cfg.icon}</div>
                  <div style="flex:1;">
                    <div style="font-weight:600;font-size:var(--fs-sm);">${cfg.label}</div>
                    <div style="font-size:var(--fs-xs);color:var(--text-secondary);margin-top:2px;">${report.description}</div>
                    <div style="font-size:var(--fs-xs);color:var(--text-muted);margin-top:4px;">
                      👍 ${report.upvotes} • ${report.status === 'verified' ? '✅ Verified' : '🕐 Active'}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  // ---- Event Listeners ----

  // Hazard type selection
  document.querySelectorAll('.hazard-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.hazard-type-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedType = btn.dataset.type;
    });
  });

  // Photo upload simulation
  document.getElementById('photo-upload').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        document.getElementById('photo-name').textContent = `📎 ${file.name}`;
      }
    };
    input.click();
  });

  // Submit report
  document.getElementById('submit-report-btn').addEventListener('click', () => {
    if (!selectedType) {
      showToast('Please select a hazard type', 'warning');
      return;
    }

    const location = document.getElementById('report-location').value.trim();
    const description = document.getElementById('report-description').value.trim();

    if (!location) {
      showToast('Please enter a location', 'warning');
      return;
    }

    // Create report with random nearby coordinates
    const newReport = {
      type: selectedType,
      lat: 12.9716 + (Math.random() - 0.5) * 0.05,
      lng: 77.5946 + (Math.random() - 0.5) * 0.05,
      description: description || `${reportTypes[selectedType].label} at ${location}`,
      upvotes: 0,
      status: 'active',
    };

    // Add marker to map
    addNewReportMarker(newReport);

    // Add to recent reports list
    const cfg = reportTypes[selectedType];
    const list = document.getElementById('reports-list');
    const newItem = document.createElement('div');
    newItem.className = 'report-item';
    newItem.style.animation = 'pageFade 0.3s ease';
    newItem.innerHTML = `
      <div class="report-type-icon ${selectedType}">${cfg.icon}</div>
      <div style="flex:1;">
        <div style="font-weight:600;font-size:var(--fs-sm);">${cfg.label}</div>
        <div style="font-size:var(--fs-xs);color:var(--text-secondary);margin-top:2px;">${newReport.description}</div>
        <div style="font-size:var(--fs-xs);color:var(--text-muted);margin-top:4px;">👍 0 • 🕐 Active • Just now</div>
      </div>
    `;
    list.prepend(newItem);

    // Reset form
    document.querySelectorAll('.hazard-type-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById('report-location').value = '';
    document.getElementById('report-description').value = '';
    document.getElementById('photo-name').textContent = '';
    selectedType = null;

    showToast('✅ Hazard report submitted! Thank you.', 'success');
  });
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span class="toast-message">${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
