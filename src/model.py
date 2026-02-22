import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
import os

def load_cleaned_data(filepath):
    """Loads the pre-processed accident data."""
    print(f"[*] Loading cleaned data from {filepath}...")
    try:
        df = pd.read_csv(filepath)
        return df
    except FileNotFoundError:
        print("[!] Error: Cleaned data not found. Run cleaner.py first.")
        return None

def calculate_risk_score(cluster_data):
    """
    Calculates a simple risk score based on the number of accidents in a cluster.
    The ML Engineer can expand this to weight 'Fatal' accidents higher.
    """
    crash_count = len(cluster_data)
    if crash_count > 50:
        return "High"
    elif crash_count > 20:
        return "Moderate"
    else:
        return "Low"

def identify_black_spots(df, k=10):
    """
    Uses Scikit-Learn's K-Means to find accident hotspots.
    """
    print(f"[*] Running K-Means Clustering with K={k}...")
    
    # 1. Extract Latitude and Longitude into a 2D NumPy Array
    # Scikit-Learn requires this specific mathematical format to run efficiently
    coordinates = df[['Latitude', 'Longitude']].to_numpy()
    
    # 2. Initialize and Fit the Model
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    df['Cluster_ID'] = kmeans.fit_predict(coordinates)
    
    # 3. Get the Centroids (The exact center of each 'Black Spot')
    centroids = kmeans.cluster_centers_
    
    # 4. Compile the final list of Black Spots with Risk Scores
    black_spots = []
    for i in range(k):
        # Isolate the data for this specific cluster
        cluster_points = df[df['Cluster_ID'] == i]
        
        # Calculate risk based on accident volume
        risk_level = calculate_risk_score(cluster_points)
        
        # Store the centroid data
        black_spots.append({
            "Cluster_ID": i,
            "Latitude": centroids[i][0],
            "Longitude": centroids[i][1],
            "Total_Crashes": len(cluster_points),
            "Risk_Level": risk_level
        })
        
    print(f"[*] Successfully identified {k} black spots.")
    return pd.DataFrame(black_spots), df

def run_ml_pipeline(input_file, output_centroids_file, k=10):
    """Executes the ML pipeline and saves the centroids."""
    df = load_cleaned_data(input_file)
    if df is None or df.empty:
        return

    # Run the clustering algorithm
    centroids_df, clustered_df = identify_black_spots(df, k=k)
    
    # Save the centroids for the Folium Map Generator to use
    os.makedirs(os.path.dirname(output_centroids_file), exist_ok=True)
    centroids_df.to_csv(output_centroids_file, index=False)
    
    print(f"--- SUCCESS: Centroid 'Black Spots' saved to {output_centroids_file} ---")

if __name__ == "__main__":
    # Dynamically set file paths
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    
    # Input: The clean file your Data Engineer made
    clean_data_path = os.path.join(base_dir, 'data', 'processed', 'accidents_clean.csv')
    
    # Output: The calculated centroids for your map
    centroids_data_path = os.path.join(base_dir, 'data', 'processed', 'cluster_centroids.csv')
    
    # Run the model! (The ML Engineer can change K=10 to whatever the Elbow Method suggests)
    run_ml_pipeline(clean_data_path, centroids_data_path, k=10)