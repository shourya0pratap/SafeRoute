/* ============================================================
   SafeRoute — Safety Scoring Engine
   Implements the formula from 08-scoring-engine-spec.md
   ============================================================ */

import { accidents } from './data.js';

/**
 * Weight profiles for day and night modes
 */
const WEIGHTS = {
  day:   { accident: 0.40, traffic: 0.20, road: 0.20, lighting: 0.10, weather: 0.10 },
  night: { accident: 0.30, traffic: 0.10, road: 0.15, lighting: 0.30, weather: 0.15 },
};

/**
 * Severity weights for accident density calculation
 */
const SEVERITY_WEIGHT = {
  minor:    1,
  moderate: 3,
  severe:   7,
  fatal:   10,
};

/**
 * Calculate accident density score for a given location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radiusKm - Search radius in km (default 0.3)
 * @returns {number} Score 0-100
 */
export function accidentDensityScore(lat, lng, radiusKm = 0.3) {
  const nearby = accidents.filter(a => {
    const dist = haversine(lat, lng, a.lat, a.lng);
    return dist <= radiusKm;
  });

  if (nearby.length === 0) return 5; // baseline

  const rawScore = nearby.reduce((sum, a) => {
    return sum + (SEVERITY_WEIGHT[a.severity] || 1);
  }, 0);

  // Normalize: max expected raw score is ~40 (4 fatal accidents nearby)
  return Math.min(100, Math.round((rawScore / 40) * 100));
}

/**
 * Simulate traffic density score
 * @returns {number} Score 0-100
 */
export function trafficDensityScore() {
  const hour = new Date().getHours();
  // Peak hours: 8-10am, 5-8pm
  if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)) {
    return 60 + Math.random() * 30; // 60-90
  }
  if (hour >= 22 || hour <= 5) {
    return 5 + Math.random() * 15; // 5-20
  }
  return 25 + Math.random() * 30; // 25-55
}

/**
 * Simulate road condition score
 * @returns {number} Score 0-100 (higher = worse)
 */
export function roadConditionScore() {
  return 15 + Math.random() * 40; // 15-55
}

/**
 * Lighting score based on time of day
 * @returns {number} Score 0-100
 */
export function lightingScore() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour <= 18) return 10 + Math.random() * 10; // Day: well-lit
  if (hour >= 19 && hour <= 21) return 40 + Math.random() * 15;
  return 65 + Math.random() * 25; // Late night: poorly lit
}

/**
 * Weather risk score (simulated)
 * @returns {number} Score 0-100
 */
export function weatherRiskScore() {
  // Simulate clear/cloudy/rainy conditions
  const conditions = ['clear', 'clouds', 'drizzle', 'rain'];
  const weights = { clear: 5, clouds: 12, drizzle: 35, rain: 55 };
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  return weights[condition] + Math.random() * 10;
}

/**
 * Calculate overall safety score for a location
 * @param {number} lat
 * @param {number} lng
 * @param {'day'|'night'} timeOfDay
 * @returns {{ overall: number, breakdown: object }}
 */
export function calculateSafetyScore(lat, lng, timeOfDay = 'auto') {
  if (timeOfDay === 'auto') {
    const hour = new Date().getHours();
    timeOfDay = (hour >= 6 && hour <= 18) ? 'day' : 'night';
  }

  const w = WEIGHTS[timeOfDay];

  const scores = {
    accident: accidentDensityScore(lat, lng),
    traffic: trafficDensityScore(),
    road: roadConditionScore(),
    lighting: lightingScore(),
    weather: weatherRiskScore(),
  };

  const overall = Math.round(
    w.accident * scores.accident +
    w.traffic  * scores.traffic +
    w.road     * scores.road +
    w.lighting * scores.lighting +
    w.weather  * scores.weather
  );

  return {
    overall: Math.min(100, Math.max(0, overall)),
    breakdown: scores,
    timeOfDay,
  };
}

/**
 * Calculate safety score for an entire route (array of waypoints)
 * @param {Array<[number, number]>} waypoints - [[lat, lng], ...]
 * @returns {{ overall: number, segments: Array }}
 */
export function calculateRouteScore(waypoints) {
  if (!waypoints || waypoints.length === 0) {
    return { overall: 50, segments: [] };
  }

  // Sample points along the route (every ~5th point)
  const sampleRate = Math.max(1, Math.floor(waypoints.length / 10));
  const segments = [];

  for (let i = 0; i < waypoints.length; i += sampleRate) {
    const [lat, lng] = waypoints[i];
    const score = calculateSafetyScore(lat, lng);
    segments.push({ lat, lng, score: score.overall });
  }

  const avgScore = Math.round(
    segments.reduce((s, seg) => s + seg.score, 0) / segments.length
  );

  return {
    overall: avgScore,
    segments,
    safetyRating: getSafetyRating(avgScore),
  };
}

/**
 * Get safety rating label and color class
 */
export function getSafetyRating(score) {
  if (score <= 20) return { label: 'Excellent', class: 'score-excellent', color: '#10b981' };
  if (score <= 40) return { label: 'Good', class: 'score-good', color: '#84cc16' };
  if (score <= 60) return { label: 'Moderate', class: 'score-moderate', color: '#f59e0b' };
  if (score <= 80) return { label: 'Poor', class: 'score-poor', color: '#f97316' };
  return { label: 'Dangerous', class: 'score-dangerous', color: '#ef4444' };
}

/**
 * Invert score for display: 100 = safest, 0 = most dangerous
 */
export function displayScore(rawScore) {
  return 100 - rawScore;
}

/**
 * Haversine distance between two lat/lng points in km
 */
export function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) { return deg * Math.PI / 180; }
