from flask import render_template, jsonify , request
import pandas as pd
import os
from app import app
from src.safety_engine import calculate_route_risk

# --- STANDARD WEB ROUTES ---

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')


# --- DYNAMIC REST API ENDPOINTS ---

@app.route('/api/clusters')
def get_clusters():
    """
    Reads the machine learning output and serves it as JSON.
    Our frontend JavaScript will 'fetch' this URL in real-time.
    """
    # Navigate to the processed data folder
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    centroids_path = os.path.join(base_dir, 'data', 'processed', 'cluster_centroids.csv')
    
    try:
        # Load the Black Spots CSV using Pandas
        df = pd.read_csv(centroids_path)
        
        # Convert the Pandas DataFrame into a List of Dictionaries (JSON format)
        clusters_data = df.to_dict(orient='records')
        
        return jsonify(clusters_data)
        
    except FileNotFoundError:
        # If the ML script hasn't been run yet, return a safe error code
        return jsonify({"error": "Data not found. Please run the ML pipeline first."}), 404
    
@app.route('/api/evaluate_route', methods=['POST'])
def evaluate_route():
    """
    Receives a polyline (array of GPS coordinates) from the frontend,
    calculates the intersections with Black Spots, and returns a Safety Score.
    """
    data = request.json
    waypoints = data.get('waypoints', [])
    
    # Load the machine learning centroids
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    centroids_path = os.path.join(base_dir, 'data', 'processed', 'cluster_centroids.csv')
    
    try:
        centroids_df = pd.read_csv(centroids_path)
        
        # Run the Haversine Intersection Algorithm
        penalty_score, spots_hit = calculate_route_risk(waypoints, centroids_df, danger_radius_meters=500)
        
        # Categorize the final safety level
        status = "Safe Route"
        if penalty_score >= 50:
            status = "High Risk Zone"
        elif penalty_score > 0:
            status = "Moderate Caution"
            
        return jsonify({
            "penalty_score": penalty_score,
            "black_spots_intersected": spots_hit,
            "status": status
        })
        
    except FileNotFoundError:
        return jsonify({"error": "Centroids file not found."}), 404

import sqlite3

# --- LIVE CROWDSOURCING DATABASE ---

def init_db():
    """Creates a local SQLite database file to store user reports."""
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    db_path = os.path.join(base_dir, 'data', 'live_reports.db')
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lat REAL,
            lon REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

# Run this instantly when the Flask server boots up
init_db()

@app.route('/api/report', methods=['POST'])
def report_accident():
    """Receives coordinates from the frontend and saves them to the DB."""
    data = request.json
    lat, lon = data.get('lat'), data.get('lon')
    
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    db_path = os.path.join(base_dir, 'data', 'live_reports.db')
    
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute('INSERT INTO reports (lat, lon) VALUES (?, ?)', (lat, lon))
    conn.commit()
    conn.close()
    
    return jsonify({"status": "success"})

@app.route('/api/live_reports', methods=['GET'])
def get_live_reports():
    """Sends all user-reported accidents to the map."""
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    db_path = os.path.join(base_dir, 'data', 'live_reports.db')
    
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute('SELECT lat, lon, timestamp FROM reports')
    rows = c.fetchall()
    conn.close()
    
    return jsonify([{"lat": r[0], "lon": r[1], "time": r[2]} for r in rows])