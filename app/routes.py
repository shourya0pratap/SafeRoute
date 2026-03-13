from flask import render_template, jsonify
import pandas as pd
import os
from app import app

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
    Your frontend JavaScript will 'fetch' this URL in real-time.
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