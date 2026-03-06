/* ============================================================
   SafeRoute — Profile & Settings Page
   ============================================================ */

export function renderProfile() {
  const user = JSON.parse(localStorage.getItem('saferoute_user') || '{}');
  const container = document.getElementById('page-container');

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <h2>Profile & Settings</h2>
        <p>Manage your account and preferences</p>
      </div>

      <div class="grid-2">
        <!-- Profile Info -->
        <div class="card">
          <div class="profile-header">
            <div class="profile-avatar">${(user.name || 'U').charAt(0).toUpperCase()}</div>
            <div class="profile-info">
              <h3>${user.name || 'User'}</h3>
              <p>${user.email || 'user@example.com'}</p>
              <p style="font-size:var(--fs-xs);color:var(--text-muted);margin-top:4px;">Member since Feb 2026</p>
            </div>
          </div>

          <div class="settings-section">
            <h4>Personal Info</h4>
            <div class="input-group">
              <label>Full Name</label>
              <input type="text" id="profile-name" value="${user.name || ''}" placeholder="Your name" />
            </div>
            <div class="input-group">
              <label>Email</label>
              <input type="email" id="profile-email" value="${user.email || ''}" placeholder="you@example.com" />
            </div>
            <div class="input-group">
              <label>Phone</label>
              <input type="tel" id="profile-phone" value="${user.phone || ''}" placeholder="+91 98765 43210" />
            </div>
            <button class="btn btn-primary btn-sm" id="save-profile-btn">Save Changes</button>
          </div>
        </div>

        <!-- Settings -->
        <div>
          <!-- Emergency Contacts -->
          <div class="card" style="margin-bottom:var(--space-lg);">
            <h3 class="card-title" style="margin-bottom:var(--space-lg);">🆘 Emergency Contacts</h3>
            <div class="contact-list" id="contacts-list">
              <div class="contact-item">
                <span style="font-size:1.3rem;">👩</span>
                <div style="flex:1;">
                  <div style="font-weight:600;font-size:var(--fs-sm);">Mom</div>
                  <div style="font-size:var(--fs-xs);color:var(--text-secondary);">+91 98765 43210</div>
                </div>
                <button class="btn-icon" title="Remove">✕</button>
              </div>
              <div class="contact-item">
                <span style="font-size:1.3rem;">👨</span>
                <div style="flex:1;">
                  <div style="font-weight:600;font-size:var(--fs-sm);">Dad</div>
                  <div style="font-size:var(--fs-xs);color:var(--text-secondary);">+91 98765 43211</div>
                </div>
                <button class="btn-icon" title="Remove">✕</button>
              </div>
            </div>
            <button class="btn btn-secondary btn-sm" style="margin-top:var(--space-md);width:100%;" id="add-contact-btn">
              + Add Contact
            </button>
          </div>

          <!-- Preferences -->
          <div class="card">
            <h3 class="card-title" style="margin-bottom:var(--space-lg);">⚙️ Preferences</h3>

            <div class="settings-row">
              <div>
                <div class="settings-label">Safety Priority</div>
                <div class="settings-desc">Higher = prefer safer routes over faster</div>
              </div>
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:var(--fs-xs);color:var(--text-muted);">Speed</span>
                <input type="range" class="range-slider" min="0" max="100" value="80" id="safety-slider" />
                <span style="font-size:var(--fs-xs);color:var(--text-muted);">Safety</span>
              </div>
            </div>

            <div class="settings-row">
              <div>
                <div class="settings-label">Night Mode</div>
                <div class="settings-desc">Auto-adjust routing for nighttime safety</div>
              </div>
              <div class="mini-toggle active" id="night-mode-toggle"></div>
            </div>

            <div class="settings-row">
              <div>
                <div class="settings-label">Voice Alerts</div>
                <div class="settings-desc">Audio warnings for upcoming hazards</div>
              </div>
              <div class="mini-toggle active" id="voice-toggle"></div>
            </div>

            <div class="settings-row">
              <div>
                <div class="settings-label">Push Notifications</div>
                <div class="settings-desc">Alerts for nearby hazards</div>
              </div>
              <div class="mini-toggle active" id="push-toggle"></div>
            </div>

            <div class="settings-row">
              <div>
                <div class="settings-label">Avoid Highways</div>
                <div class="settings-desc">Prefer local roads for routing</div>
              </div>
              <div class="mini-toggle" id="highway-toggle"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // ---- Event Listeners ----

  // Toggle switches
  document.querySelectorAll('.mini-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
    });
  });

  // Save profile
  document.getElementById('save-profile-btn').addEventListener('click', () => {
    const updatedUser = {
      ...user,
      name: document.getElementById('profile-name').value,
      email: document.getElementById('profile-email').value,
      phone: document.getElementById('profile-phone').value,
    };
    localStorage.setItem('saferoute_user', JSON.stringify(updatedUser));

    // Update sidebar
    const sidebarName = document.querySelector('.user-name');
    const sidebarEmail = document.querySelector('.user-email');
    const sidebarAvatar = document.querySelector('.user-avatar');
    if (sidebarName) sidebarName.textContent = updatedUser.name;
    if (sidebarEmail) sidebarEmail.textContent = updatedUser.email;
    if (sidebarAvatar) sidebarAvatar.textContent = updatedUser.name.charAt(0).toUpperCase();

    showToast('✅ Profile saved successfully!', 'success');
  });

  // Add contact
  document.getElementById('add-contact-btn').addEventListener('click', () => {
    const name = prompt('Contact name:');
    const phone = prompt('Phone number:');
    if (name && phone) {
      const list = document.getElementById('contacts-list');
      const item = document.createElement('div');
      item.className = 'contact-item';
      item.style.animation = 'pageFade 0.3s ease';
      item.innerHTML = `
        <span style="font-size:1.3rem;">👤</span>
        <div style="flex:1;">
          <div style="font-weight:600;font-size:var(--fs-sm);">${name}</div>
          <div style="font-size:var(--fs-xs);color:var(--text-secondary);">${phone}</div>
        </div>
        <button class="btn-icon" title="Remove">✕</button>
      `;
      list.appendChild(item);
      showToast(`Contact "${name}" added`, 'success');
    }
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
