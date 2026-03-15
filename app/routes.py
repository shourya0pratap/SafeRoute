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
    data = request.json
    waypoints = data.get('waypoints', [])
    
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    centroids_path = os.path.join(base_dir, 'data', 'processed', 'cluster_centroids.csv')
    db_path = os.path.join(base_dir, 'data', 'live_reports.db')
    
    # Fetch live reports from the SQLite database
    live_reports = []
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        c.execute('SELECT lat, lon FROM reports')
        rows = c.fetchall()
        conn.close()
        live_reports = [{'lat': r[0], 'lon': r[1]} for r in rows]
    
    try:
        centroids_df = pd.read_csv(centroids_path)
        
        # Pass both historical data AND live reports to the engine
        penalty_score, spots_hit, live_hits = calculate_route_risk(waypoints, centroids_df, live_reports)
        
        status = "Safe Route"
        if penalty_score >= 75:
            status = "High Risk Zone"
        elif penalty_score > 0:
            status = "Moderate Caution"
            
        return jsonify({
            "penalty_score": penalty_score,
            "black_spots_intersected": spots_hit,
            "live_reports_intersected": live_hits,
            "status": status
        })
        
    except FileNotFoundError:
        return jsonify({"error": "Centroids file not found."}), 404

import sqlite3

def init_db():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    db_path = os.path.join(base_dir, 'data', 'live_reports.db')
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    # Added hazard_type to the database table!
    c.execute('''
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lat REAL,
            lon REAL,
            hazard_type TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.route('/api/report', methods=['POST'])
def report_accident():
    data = request.json
    lat, lon = data.get('lat'), data.get('lon')
    hazard_type = data.get('type', 'Accident') # Defaults to Accident if missing
    
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    db_path = os.path.join(base_dir, 'data', 'live_reports.db')
    
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute('INSERT INTO reports (lat, lon, hazard_type) VALUES (?, ?, ?)', (lat, lon, hazard_type))
    conn.commit()
    conn.close()
    
    return jsonify({"status": "success"})

@app.route('/api/live_reports', methods=['GET'])
def get_live_reports():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    db_path = os.path.join(base_dir, 'data', 'live_reports.db')
    
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute('SELECT lat, lon, hazard_type, timestamp FROM reports')
    rows = c.fetchall()
    conn.close()
    
    # Send the hazard type to the frontend
    return jsonify([{"lat": r[0], "lon": r[1], "type": r[2], "time": r[3]} for r in rows])