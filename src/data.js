/* ============================================================
   SafeRoute — Mock Data
   Centered around Gurugram, Haryana, India
   ============================================================ */

// ---- Accident Hotspots ----
export const accidents = [
  // --- Gurugram Data ---
  { id: 1, lat: 28.4729, lng: 77.0320, severity: 'fatal', date: '2025-11-12', name: 'IFFCO Chowk', fatalities: 2, injuries: 5, vehicles: 4 },
  { id: 2, lat: 28.4735, lng: 77.0315, severity: 'severe', date: '2025-10-05', name: 'IFFCO Chowk', fatalities: 0, injuries: 3, vehicles: 3 },
  { id: 3, lat: 28.4722, lng: 77.0328, severity: 'moderate', date: '2025-09-18', name: 'IFFCO Chowk', fatalities: 0, injuries: 2, vehicles: 2 },
  { id: 4, lat: 28.4740, lng: 77.0310, severity: 'minor', date: '2026-01-02', name: 'IFFCO Chowk', fatalities: 0, injuries: 0, vehicles: 2 },
  { id: 5, lat: 28.4595, lng: 77.0266, severity: 'severe', date: '2025-08-22', name: 'Rajiv Chowk', fatalities: 1, injuries: 4, vehicles: 3 },
  { id: 6, lat: 28.4600, lng: 77.0260, severity: 'moderate', date: '2025-11-30', name: 'Rajiv Chowk', fatalities: 0, injuries: 2, vehicles: 2 },
  { id: 7, lat: 28.4588, lng: 77.0272, severity: 'severe', date: '2025-07-15', name: 'Rajiv Chowk', fatalities: 0, injuries: 3, vehicles: 4 },
  { id: 8, lat: 28.4425, lng: 77.0430, severity: 'fatal', date: '2025-10-10', name: 'Hero Honda Chowk', fatalities: 3, injuries: 6, vehicles: 5 },
  { id: 9, lat: 28.4430, lng: 77.0425, severity: 'severe', date: '2025-12-15', name: 'Hero Honda Chowk', fatalities: 1, injuries: 3, vehicles: 3 },
  { id: 10, lat: 28.4418, lng: 77.0438, severity: 'moderate', date: '2026-01-05', name: 'Hero Honda Chowk', fatalities: 0, injuries: 2, vehicles: 2 },
  { id: 11, lat: 28.4420, lng: 77.0440, severity: 'minor', date: '2026-02-10', name: 'Hero Honda Chowk', fatalities: 0, injuries: 0, vehicles: 2 },
  { id: 12, lat: 28.4133, lng: 77.0425, severity: 'severe', date: '2025-06-20', name: 'Subhash Chowk', fatalities: 1, injuries: 4, vehicles: 4 },
  { id: 13, lat: 28.4140, lng: 77.0418, severity: 'moderate', date: '2025-09-03', name: 'Subhash Chowk', fatalities: 0, injuries: 2, vehicles: 3 },
  { id: 14, lat: 28.4128, lng: 77.0432, severity: 'severe', date: '2025-11-18', name: 'Subhash Chowk', fatalities: 0, injuries: 3, vehicles: 2 },
  { id: 15, lat: 28.4950, lng: 77.0880, severity: 'severe', date: '2025-05-14', name: 'NH-48 (Delhi–Jaipur Highway)', fatalities: 2, injuries: 5, vehicles: 3 },
  { id: 16, lat: 28.4920, lng: 77.0850, severity: 'fatal', date: '2025-08-09', name: 'NH-48 (Delhi–Jaipur Highway)', fatalities: 3, injuries: 7, vehicles: 4 },
  { id: 17, lat: 28.4980, lng: 77.0900, severity: 'moderate', date: '2025-12-22', name: 'NH-48 (Delhi–Jaipur Highway)', fatalities: 0, injuries: 1, vehicles: 2 },
  { id: 18, lat: 28.4683, lng: 77.0720, severity: 'moderate', date: '2025-10-28', name: 'Sohna Road', fatalities: 0, injuries: 2, vehicles: 3 },
  { id: 19, lat: 28.4650, lng: 77.0700, severity: 'severe', date: '2025-07-11', name: 'Sohna Road', fatalities: 1, injuries: 3, vehicles: 2 },
  { id: 20, lat: 28.4700, lng: 77.0735, severity: 'minor', date: '2026-01-15', name: 'Sohna Road', fatalities: 0, injuries: 0, vehicles: 2 },
  { id: 21, lat: 28.4570, lng: 77.0930, severity: 'moderate', date: '2025-09-25', name: 'Golf Course Road', fatalities: 0, injuries: 2, vehicles: 2 },
  { id: 22, lat: 28.4580, lng: 77.0950, severity: 'severe', date: '2025-11-02', name: 'Golf Course Road', fatalities: 0, injuries: 4, vehicles: 3 },
  { id: 23, lat: 28.4560, lng: 77.0910, severity: 'minor', date: '2026-02-01', name: 'Golf Course Road', fatalities: 0, injuries: 0, vehicles: 2 },
  { id: 24, lat: 28.4960, lng: 77.0910, severity: 'moderate', date: '2025-08-18', name: 'Cyber City', fatalities: 0, injuries: 1, vehicles: 2 },
  { id: 25, lat: 28.4970, lng: 77.0900, severity: 'minor', date: '2025-12-05', name: 'Cyber City', fatalities: 0, injuries: 0, vehicles: 2 },
  { id: 26, lat: 28.4500, lng: 77.0150, severity: 'severe', date: '2025-11-08', name: 'Palam Vihar', fatalities: 0, injuries: 3, vehicles: 3 },
  { id: 27, lat: 28.4510, lng: 77.0140, severity: 'moderate', date: '2025-06-30', name: 'Palam Vihar', fatalities: 0, injuries: 1, vehicles: 2 },
  { id: 28, lat: 28.4260, lng: 77.0530, severity: 'minor', date: '2026-01-20', name: 'Sector 56', fatalities: 0, injuries: 0, vehicles: 2 },
  { id: 29, lat: 28.4850, lng: 77.1000, severity: 'moderate', date: '2025-10-22', name: 'MG Road Gurugram', fatalities: 0, injuries: 1, vehicles: 2 },
  { id: 30, lat: 28.4842, lng: 77.0985, severity: 'severe', date: '2025-09-15', name: 'MG Road Gurugram', fatalities: 0, injuries: 2, vehicles: 3 },
  { id: 31, lat: 28.3945, lng: 77.0330, severity: 'moderate', date: '2025-12-10', name: 'Manesar', fatalities: 0, injuries: 1, vehicles: 2 },
  { id: 32, lat: 28.3960, lng: 77.0345, severity: 'severe', date: '2025-11-25', name: 'Manesar', fatalities: 1, injuries: 2, vehicles: 3 },
  { id: 33, lat: 28.5050, lng: 77.0500, severity: 'minor', date: '2026-02-15', name: 'Udyog Vihar', fatalities: 0, injuries: 0, vehicles: 2 },
  { id: 34, lat: 28.4780, lng: 77.0200, severity: 'moderate', date: '2025-09-20', name: 'Sector 14', fatalities: 0, injuries: 2, vehicles: 2 },
  { id: 35, lat: 28.5120, lng: 77.0600, severity: 'minor', date: '2026-01-28', name: 'Dwarka Expressway', fatalities: 0, injuries: 0, vehicles: 2 },
  { id: 36, lat: 28.5100, lng: 77.0580, severity: 'severe', date: '2025-10-05', name: 'Dwarka Expressway', fatalities: 1, injuries: 3, vehicles: 4 },
  { id: 37, lat: 28.4350, lng: 77.0600, severity: 'moderate', date: '2025-08-14', name: 'Sector 49', fatalities: 0, injuries: 1, vehicles: 2 },
  { id: 38, lat: 28.4480, lng: 77.0680, severity: 'minor', date: '2026-02-20', name: 'Sector 38', fatalities: 0, injuries: 0, vehicles: 2 },
  { id: 39, lat: 28.4820, lng: 77.1050, severity: 'moderate', date: '2025-07-22', name: 'Huda City Centre', fatalities: 0, injuries: 2, vehicles: 2 },
  { id: 40, lat: 28.4830, lng: 77.1060, severity: 'severe', date: '2025-12-01', name: 'Huda City Centre', fatalities: 0, injuries: 3, vehicles: 3 },
];

// ---- Heatmap Points (lat, lng, intensity) ----
export function getHeatmapData() {
  const severityWeight = { minor: 0.3, moderate: 0.6, severe: 0.85, fatal: 1.0 };
  return accidents.map(a => [a.lat, a.lng, severityWeight[a.severity] || 0.5]);
}

// ---- User Reports ----
export const userReports = [
  { id: 'r1', type: 'pothole', lat: 28.4730, lng: 77.0300, description: 'Massive pothole near IFFCO Chowk underpass', status: 'active', upvotes: 18, createdAt: '2026-02-28T10:30:00Z' },
  { id: 'r2', type: 'broken_light', lat: 28.4680, lng: 77.0700, description: 'Multiple streetlights out on Sohna Road near Sector 47', status: 'verified', upvotes: 11, createdAt: '2026-02-27T22:15:00Z' },
  { id: 'r3', type: 'flooding', lat: 28.4600, lng: 77.0250, description: 'Severe waterlogging after rain on Basai Road', status: 'active', upvotes: 22, createdAt: '2026-02-26T08:00:00Z' },
  { id: 'r4', type: 'road_damage', lat: 28.4420, lng: 77.0440, description: 'Road caved in near Hero Honda Chowk flyover', status: 'active', upvotes: 30, createdAt: '2026-02-25T14:45:00Z' },
  { id: 'r5', type: 'accident', lat: 28.4950, lng: 77.0880, description: 'Truck overturned on NH-48, traffic jam for 3 km', status: 'verified', upvotes: 35, createdAt: '2026-03-01T07:30:00Z' },
  { id: 'r6', type: 'pothole', lat: 28.4570, lng: 77.0930, description: 'Potholes on Golf Course Road near DLF Phase 5', status: 'active', upvotes: 9, createdAt: '2026-03-01T16:00:00Z' },
  { id: 'r7', type: 'broken_light', lat: 28.4133, lng: 77.0425, description: 'Dark stretch near Subhash Chowk — no lights for 500m', status: 'active', upvotes: 14, createdAt: '2026-03-01T21:00:00Z' },
  { id: 'r8', type: 'road_damage', lat: 28.5100, lng: 77.0580, description: 'Unfinished construction on Dwarka Expressway, dangerous lane merge', status: 'verified', upvotes: 27, createdAt: '2026-02-28T09:00:00Z' },
];

// ---- Trips ----
export const trips = [
  { id: 't1', origin: 'Cyber City', destination: 'Golf Course Road', originCoords: [28.4960, 77.0910], destCoords: [28.4570, 77.0930], safetyScore: 74, distance: 8.2, duration: 25, mode: 'safest', date: '2026-03-01' },
  { id: 't2', origin: 'IFFCO Chowk', destination: 'Manesar', originCoords: [28.4729, 77.0320], destCoords: [28.3945, 77.0330], safetyScore: 52, distance: 15.6, duration: 35, mode: 'balanced', date: '2026-02-28' },
  { id: 't3', origin: 'Huda City Centre', destination: 'Palam Vihar', originCoords: [28.4820, 77.1050], destCoords: [28.4500, 77.0150], safetyScore: 81, distance: 12.1, duration: 30, mode: 'safest', date: '2026-02-27' },
  { id: 't4', origin: 'Sector 14', destination: 'Sohna Road', originCoords: [28.4780, 77.0200], destCoords: [28.4683, 77.0720], safetyScore: 65, distance: 10.4, duration: 28, mode: 'fastest', date: '2026-02-26' },
  { id: 't5', origin: 'Rajiv Chowk', destination: 'Dwarka Expressway', originCoords: [28.4595, 77.0266], destCoords: [28.5120, 77.0600], safetyScore: 70, distance: 11.8, duration: 32, mode: 'safest', date: '2026-02-25' },
  { id: 't6', origin: 'Hero Honda Chowk', destination: 'MG Road', originCoords: [28.4425, 77.0430], destCoords: [28.4850, 77.1000], safetyScore: 48, distance: 14.2, duration: 40, mode: 'balanced', date: '2026-02-24' },
  { id: 't7', origin: 'Subhash Chowk', destination: 'Udyog Vihar', originCoords: [28.4133, 77.0425], destCoords: [28.5050, 77.0500], safetyScore: 60, distance: 13.5, duration: 38, mode: 'fastest', date: '2026-02-23' },
  { id: 't8', origin: 'Golf Course Road', destination: 'Sector 56', originCoords: [28.4570, 77.0930], destCoords: [28.4260, 77.0530], safetyScore: 82, distance: 7.3, duration: 20, mode: 'safest', date: '2026-02-22' },
];

// ---- Report Type Config ----
export const reportTypes = {
  pothole: { icon: '🕳️', label: 'Pothole', color: '#f59e0b' },
  broken_light: { icon: '💡', label: 'Broken Light', color: '#ef4444' },
  flooding: { icon: '🌊', label: 'Flooding', color: '#3b82f6' },
  accident: { icon: '💥', label: 'Accident', color: '#dc2626' },
  road_damage: { icon: '🚧', label: 'Road Damage', color: '#f97316' },
  other: { icon: '⚠️', label: 'Other', color: '#8b5cf6' },
};

// ---- Dashboard Stats ----
export function getDashboardStats() {
  const totalTrips = trips.length;
  const avgScore = Math.round(trips.reduce((s, t) => s + t.safetyScore, 0) / totalTrips);
  const totalDistance = trips.reduce((s, t) => s + t.distance, 0).toFixed(1);
  const totalReports = userReports.length;

  return { totalTrips, avgScore, totalDistance, totalReports };
}

// ---- Weekly Safety Data (for chart) ----
export const weeklySafetyData = [
  { day: 'Mon', score: 68 },
  { day: 'Tue', score: 72 },
  { day: 'Wed', score: 78 },
  { day: 'Thu', score: 65 },
  { day: 'Fri', score: 55 },
  { day: 'Sat', score: 82 },
  { day: 'Sun', score: 80 },
];

// ---- Dangerous Areas ----
export const dangerousAreas = [
  { name: 'Hero Honda Chowk', score: 12, accidents: 4 },
  { name: 'NH-48 (Delhi–Jaipur Highway)', score: 15, accidents: 3 },
  { name: 'IFFCO Chowk', score: 20, accidents: 4 },
  { name: 'Subhash Chowk', score: 25, accidents: 3 },
  { name: 'Rajiv Chowk', score: 30, accidents: 3 },
];

// ---- Predefined Locations (for quick selection) ----
export const popularLocations = [
  { name: 'IFFCO Chowk', lat: 28.4729, lng: 77.0320 },
  { name: 'Rajiv Chowk', lat: 28.4595, lng: 77.0266 },
  { name: 'Cyber City', lat: 28.4960, lng: 77.0910 },
  { name: 'Cyber Hub', lat: 28.4942, lng: 77.0888 },
  { name: 'Golf Course Road', lat: 28.4570, lng: 77.0930 },
  { name: 'Sohna Road', lat: 28.4683, lng: 77.0720 },
  { name: 'MG Road Gurugram', lat: 28.4850, lng: 77.1000 },
  { name: 'Huda City Centre', lat: 28.4820, lng: 77.1050 },
  { name: 'Hero Honda Chowk', lat: 28.4425, lng: 77.0430 },
  { name: 'Subhash Chowk', lat: 28.4133, lng: 77.0425 },
  { name: 'Sector 14', lat: 28.4780, lng: 77.0200 },
  { name: 'Palam Vihar', lat: 28.4500, lng: 77.0150 },
  { name: 'DLF Phase 1', lat: 28.4744, lng: 77.0926 },
  { name: 'DLF Phase 5', lat: 28.4520, lng: 77.0960 },
  { name: 'Udyog Vihar', lat: 28.5050, lng: 77.0500 },
  { name: 'Manesar', lat: 28.3945, lng: 77.0330 },
  { name: 'Dwarka Expressway', lat: 28.5120, lng: 77.0600 },
  { name: 'Sector 29', lat: 28.4612, lng: 77.0600 },
  { name: 'Sector 38', lat: 28.4480, lng: 77.0680 },
  { name: 'Sector 49', lat: 28.4350, lng: 77.0600 },
  { name: 'Sector 56', lat: 28.4260, lng: 77.0530 },
  { name: 'Sector 57', lat: 28.4300, lng: 77.0700 },
];
