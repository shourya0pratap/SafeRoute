/* ============================================================
   SafeRoute — Main Entry Point
   App initialization, routing, auth, sidebar, SOS, theme
   ============================================================ */

import './styles.css';

// Page modules
import { renderHome } from './pages/home.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderReport } from './pages/report.js';
import { renderTrips } from './pages/trips.js';
import { renderProfile } from './pages/profile.js';
import { destroyMap, updateMapTheme, resizeMap } from './map.js';

// ---- STATE ----
let currentPage = 'home';

// ---- Page titles ----
const pageTitles = {
  home: 'Map',
  dashboard: 'Dashboard',
  report: 'Report Hazard',
  trips: 'Trip History',
  profile: 'Profile',
};

// ============================================================
// APP INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupAuth();
  setupSidebar();
  setupThemeToggle();
  setupSOS();
  setupTopbar();

  // Handle hash-based routing
  window.addEventListener('hashchange', () => {
    const page = window.location.hash.slice(1) || 'home';
    navigateTo(page);
  });
});

// ============================================================
// AUTH
// ============================================================
function checkAuth() {
  const user = localStorage.getItem('saferoute_user');
  if (user) {
    showApp(JSON.parse(user));
  }
}

function setupAuth() {
  // Toggle between login and signup
  document.getElementById('show-signup').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('signup-form').classList.remove('hidden');
  });

  document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
  });

  // Login form
  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) return;

    // Simulate auth (accept any credentials)
    const user = {
      name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      email,
      phone: '',
    };
    localStorage.setItem('saferoute_user', JSON.stringify(user));
    showApp(user);
  });

  // Signup form
  document.getElementById('signup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const phone = document.getElementById('signup-phone').value;

    if (!name || !email) return;

    const user = { name, email, phone };
    localStorage.setItem('saferoute_user', JSON.stringify(user));
    showApp(user);
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('saferoute_user');
    destroyMap();
    document.getElementById('app').classList.add('hidden');
    document.getElementById('auth-overlay').classList.remove('hidden');
    // Reset forms
    document.getElementById('login-form').reset();
    document.getElementById('signup-form').reset();
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
  });
}

function showApp(user) {
  document.getElementById('auth-overlay').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');

  // Update sidebar user info
  const userName = document.querySelector('.user-name');
  const userEmail = document.querySelector('.user-email');
  const userAvatar = document.querySelector('.user-avatar');
  if (userName) userName.textContent = user.name || 'User';
  if (userEmail) userEmail.textContent = user.email || '';
  if (userAvatar) userAvatar.textContent = (user.name || 'U').charAt(0).toUpperCase();

  // Navigate to home
  const page = window.location.hash.slice(1) || 'home';
  navigateTo(page);
}

// ============================================================
// ROUTER
// ============================================================
function navigateTo(page) {
  if (!pageTitles[page]) page = 'home';

  // Destroy map when leaving home
  if (currentPage === 'home' && page !== 'home') {
    destroyMap();
  }

  currentPage = page;
  window.location.hash = page;

  // Update page title
  document.getElementById('page-title').textContent = pageTitles[page];

  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });

  // Render page
  switch (page) {
    case 'home':
      renderHome();
      break;
    case 'dashboard':
      renderDashboard();
      break;
    case 'report':
      renderReport();
      break;
    case 'trips':
      renderTrips();
      break;
    case 'profile':
      renderProfile();
      break;
    default:
      renderHome();
  }
}

// ============================================================
// SIDEBAR
// ============================================================
function setupSidebar() {
  // Nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      navigateTo(page);
    });
  });

  // Toggle sidebar collapse
  document.getElementById('sidebar-toggle').addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
    // Resize map if on home page
    if (currentPage === 'home') {
      resizeMap();
    }
  });
}

// ============================================================
// THEME TOGGLE
// ============================================================
function setupThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  const themeIcon = toggle.querySelector('.theme-icon');

  // Load saved theme
  const savedTheme = localStorage.getItem('saferoute_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeIcon.textContent = savedTheme === 'dark' ? '🌙' : '☀️';

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('saferoute_theme', next);
    themeIcon.textContent = next === 'dark' ? '🌙' : '☀️';

    // Update map tiles
    updateMapTheme(next === 'dark');
  });
}

// ============================================================
// SOS
// ============================================================
function setupSOS() {
  const floatBtn = document.getElementById('sos-float-btn');
  const modal = document.getElementById('sos-modal');
  const closeBtn = document.getElementById('sos-close');
  const triggerBtn = document.getElementById('sos-trigger');
  const cancelBtn = document.getElementById('sos-cancel');
  const doneBtn = document.getElementById('sos-done');
  const countdownDiv = document.getElementById('sos-countdown');
  const idleDiv = document.getElementById('sos-idle');
  const sentDiv = document.getElementById('sos-sent');
  const countdownNumber = document.getElementById('countdown-number');

  let countdownInterval = null;

  floatBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    resetSOS();
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    clearInterval(countdownInterval);
    resetSOS();
  });

  // Click outside modal to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
      clearInterval(countdownInterval);
      resetSOS();
    }
  });

  triggerBtn.addEventListener('click', () => {
    idleDiv.classList.add('hidden');
    countdownDiv.classList.remove('hidden');

    let count = 5;
    countdownNumber.textContent = count;

    countdownInterval = setInterval(() => {
      count--;
      countdownNumber.textContent = count;

      if (count <= 0) {
        clearInterval(countdownInterval);
        // SOS Sent!
        countdownDiv.classList.add('hidden');
        sentDiv.classList.remove('hidden');
        showToast('🚨 SOS alert sent to emergency contacts!', 'error');
      }
    }, 1000);
  });

  cancelBtn.addEventListener('click', () => {
    clearInterval(countdownInterval);
    resetSOS();
    showToast('SOS cancelled', 'info');
  });

  doneBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    resetSOS();
  });

  function resetSOS() {
    idleDiv.classList.remove('hidden');
    countdownDiv.classList.add('hidden');
    sentDiv.classList.add('hidden');
    countdownNumber.textContent = '5';
  }
}

// ============================================================
// TOPBAR
// ============================================================
function setupTopbar() {
  const alertsBtn = document.getElementById('topbar-alerts');
  alertsBtn.addEventListener('click', () => {
    showToast('⚠️ 3 new hazard alerts in your area', 'warning');
  });

  const searchInput = document.getElementById('topbar-search');
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        showToast(`🔍 Searching for "${query}"...`, 'info');
        // Navigate to home/map
        if (currentPage !== 'home') navigateTo('home');
      }
    }
  });
}

// ============================================================
// TOAST UTILITY
// ============================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { success: '✅', error: '🚨', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <span class="toast-message">${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
