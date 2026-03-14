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