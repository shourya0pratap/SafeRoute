import logging
import os
import sqlite3
import time
from collections import defaultdict, deque
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
from flask import jsonify, render_template, request

from app import app
from src.safety_engine import calculate_route_risk


logger = logging.getLogger(__name__)
ALLOWED_HAZARD_TYPES = {"Accident", "Traffic Jam", "Road Block", "Flooding", "Construction"}
_report_request_history: dict[str, deque[float]] = defaultdict(deque)


def _is_api_request() -> bool:
    return request.path.startswith("/api/") or request.path == "/healthz"


def _client_ip() -> str:
    forwarded_for = request.headers.get("X-Forwarded-For", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.remote_addr or "unknown"


def _json_error(message: str, status_code: int):
    return jsonify({"error": message}), status_code


def _parse_coordinate(value, name: str):
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        raise ValueError(f"{name} must be a valid number")

    if name == "lat" and not (-90 <= parsed <= 90):
        raise ValueError("lat must be between -90 and 90")
    if name == "lon" and not (-180 <= parsed <= 180):
        raise ValueError("lon must be between -180 and 180")

    return parsed


def _validate_json_body(required_keys: set[str]):
    if not request.is_json:
        raise ValueError("Request must use application/json")

    payload = request.get_json(silent=True)
    if payload is None or not isinstance(payload, dict):
        raise ValueError("Malformed JSON payload")

    missing = required_keys.difference(payload.keys())
    if missing:
        raise ValueError(f"Missing required keys: {', '.join(sorted(missing))}")
    return payload


def _check_report_rate_limit(ip_address: str) -> bool:
    now = time.time()
    window = app.config["REPORT_RATE_LIMIT_WINDOW_SECONDS"]
    max_requests = app.config["REPORT_RATE_LIMIT_MAX_REQUESTS"]

    requests_for_ip = _report_request_history[ip_address]
    while requests_for_ip and requests_for_ip[0] <= now - window:
        requests_for_ip.popleft()

    if len(requests_for_ip) >= max_requests:
        return False

    requests_for_ip.append(now)
    return True


def _load_live_reports_for_scoring(db_path: Path):
    if not db_path.exists():
        return []

    with sqlite3.connect(db_path) as conn:
        rows = conn.execute("SELECT lat, lon, hazard_type FROM reports").fetchall()

    return [{"lat": row[0], "lon": row[1], "type": row[2]} for row in rows]


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")


@app.route("/healthz", methods=["GET"])
def healthz():
    db_path = Path(app.config["LIVE_REPORTS_DB_PATH"])
    return jsonify(
        {
            "status": "ok",
            "time": datetime.now(timezone.utc).isoformat(),
            "live_reports_db_present": db_path.exists(),
        }
    )


@app.route("/api/clusters")
def get_clusters():
    centroids_path = Path(app.config["CLUSTERS_FILE"])

    try:
        df = pd.read_csv(centroids_path)
        clusters_data = df.to_dict(orient="records")
        return jsonify(clusters_data)
    except FileNotFoundError:
        return _json_error("Data not found. Please run the ML pipeline first.", 404)


@app.route("/api/evaluate_route", methods=["POST"])
def evaluate_route():
    try:
        payload = _validate_json_body({"waypoints"})
        waypoints = payload.get("waypoints")
        if not isinstance(waypoints, list) or not waypoints:
            raise ValueError("waypoints must be a non-empty array")
        if len(waypoints) > app.config["ROUTE_MAX_WAYPOINTS"]:
            raise ValueError(
                f"waypoints exceeds limit of {app.config['ROUTE_MAX_WAYPOINTS']}"
            )

        normalized_waypoints = []
        for point in waypoints:
            if not isinstance(point, dict):
                raise ValueError("each waypoint must be an object with lat and lon")
            normalized_waypoints.append(
                {
                    "lat": _parse_coordinate(point.get("lat"), "lat"),
                    "lon": _parse_coordinate(point.get("lon"), "lon"),
                }
            )

        centroids_path = Path(app.config["CLUSTERS_FILE"])
        db_path = Path(app.config["LIVE_REPORTS_DB_PATH"])

        centroids_df = pd.read_csv(centroids_path)
        live_reports = _load_live_reports_for_scoring(db_path)

        penalty_score, spots_hit, live_hits = calculate_route_risk(
            normalized_waypoints, centroids_df, live_reports
        )

        status = "Safe Route"
        if penalty_score >= 75:
            status = "High Risk Zone"
        elif penalty_score > 0:
            status = "Moderate Caution"

        return jsonify(
            {
                "penalty_score": penalty_score,
                "black_spots_intersected": spots_hit,
                "live_reports_intersected": live_hits,
                "status": status,
            }
        )
    except FileNotFoundError:
        return _json_error("Centroids file not found.", 404)
    except ValueError as exc:
        return _json_error(str(exc), 400)


@app.route("/api/report", methods=["POST"])
def report_accident():
    if app.config["REQUIRE_REPORT_API_KEY"]:
        provided_key = request.headers.get("X-API-Key", "")
        if not provided_key or provided_key != app.config["REPORT_API_KEY"]:
            return _json_error("Unauthorized", 401)

    client_ip = _client_ip()
    if not _check_report_rate_limit(client_ip):
        return _json_error("Rate limit exceeded. Please try again later.", 429)

    try:
        payload = _validate_json_body({"lat", "lon", "type"})
        lat = _parse_coordinate(payload.get("lat"), "lat")
        lon = _parse_coordinate(payload.get("lon"), "lon")
        hazard_type = str(payload.get("type")).strip()

        if hazard_type not in ALLOWED_HAZARD_TYPES:
            raise ValueError(
                f"type must be one of: {', '.join(sorted(ALLOWED_HAZARD_TYPES))}"
            )

        db_path = Path(app.config["LIVE_REPORTS_DB_PATH"])
        db_path.parent.mkdir(parents=True, exist_ok=True)

        with sqlite3.connect(db_path) as conn:
            conn.execute(
                "INSERT INTO reports (lat, lon, hazard_type) VALUES (?, ?, ?)",
                (lat, lon, hazard_type),
            )
            conn.commit()

        return jsonify({"status": "success"}), 201
    except ValueError as exc:
        return _json_error(str(exc), 400)


@app.route("/api/live_reports", methods=["GET"])
def get_live_reports():
    db_path = Path(app.config["LIVE_REPORTS_DB_PATH"])
    if not db_path.exists():
        return jsonify([])

    with sqlite3.connect(db_path) as conn:
        rows = conn.execute(
            "SELECT lat, lon, hazard_type, timestamp FROM reports ORDER BY timestamp DESC LIMIT 500"
        ).fetchall()

    return jsonify(
        [{"lat": r[0], "lon": r[1], "type": r[2], "time": r[3]} for r in rows]
    )


def init_db():
    db_path = Path(app.config["LIVE_REPORTS_DB_PATH"])
    db_path.parent.mkdir(parents=True, exist_ok=True)

    with sqlite3.connect(db_path) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                lat REAL NOT NULL,
                lon REAL NOT NULL,
                hazard_type TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.commit()


@app.before_request
def enforce_https():
    if not app.config.get("ENFORCE_HTTPS") or not _is_api_request():
        return None

    if request.is_secure:
        return None

    forwarded_proto = request.headers.get("X-Forwarded-Proto", "").lower()
    if forwarded_proto == "https":
        return None

    return _json_error("HTTPS is required", 400)


@app.errorhandler(404)
def handle_404(_error):
    if _is_api_request():
        return _json_error("Not found", 404)
    return render_template("index.html"), 404


@app.errorhandler(405)
def handle_405(_error):
    if _is_api_request():
        return _json_error("Method not allowed", 405)
    return _error


@app.errorhandler(500)
def handle_500(error):
    logger.exception("Unhandled server error", extra={"path": request.path})
    if _is_api_request():
        return _json_error("Internal server error", 500)
    return error


init_db()
