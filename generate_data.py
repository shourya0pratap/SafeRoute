import pandas as pd
import numpy as np
import random
import os

def generate_pan_india_data():
    # 1. MAJOR URBAN HUBS 
    # Notice: Mumbai and Chennai have a smaller "spread" and their longitude 
    # is shifted slightly inland so the bell curve doesn't spill into the ocean!
    hubs = [
        {"name": "Delhi", "lat": 28.6139, "lon": 77.2090, "spread": 0.08, "weight": 0.1},
        {"name": "Mumbai", "lat": 19.0760, "lon": 73.0000, "spread": 0.04, "weight": 0.08}, 
        {"name": "Bangalore", "lat": 12.9716, "lon": 77.5946, "spread": 0.08, "weight": 0.08},
        {"name": "Chennai", "lat": 13.0827, "lon": 80.2000, "spread": 0.04, "weight": 0.06}, 
        {"name": "Kolkata", "lat": 22.5726, "lon": 88.3639, "spread": 0.05, "weight": 0.06},
        {"name": "Hyderabad", "lat": 17.3850, "lon": 78.4867, "spread": 0.08, "weight": 0.06},
        {"name": "Ahmedabad", "lat": 23.0225, "lon": 72.5714, "spread": 0.05, "weight": 0.05},
        {"name": "Pune", "lat": 18.5204, "lon": 73.8567, "spread": 0.05, "weight": 0.05},
        {"name": "Jaipur", "lat": 26.9124, "lon": 75.7873, "spread": 0.05, "weight": 0.04},
        {"name": "Lucknow", "lat": 26.8467, "lon": 80.9462, "spread": 0.05, "weight": 0.04}
    ]
    
    # 2. MAJOR HIGHWAY CORRIDORS (Linear Interpolation)
    corridors = [
        {"start": (28.61, 77.20), "end": (19.07, 73.00)}, # Delhi to Mumbai
        {"start": (19.07, 73.00), "end": (12.97, 77.59)}, # Mumbai to Bangalore
        {"start": (28.61, 77.20), "end": (17.38, 78.48)}, # Delhi to Hyd
        {"start": (17.38, 78.48), "end": (12.97, 77.59)}, # Hyd to Bangalore
        
        # Instead of Kol -> Chennai (which crosses the ocean), we route through Vizag!
        {"start": (22.57, 88.36), "end": (17.68, 83.21)}, # Kolkata to Visakhapatnam
        {"start": (17.68, 83.21), "end": (13.08, 80.20)}, # Visakhapatnam to Chennai
        
        {"start": (28.61, 77.20), "end": (22.57, 88.36)}, # Delhi to Kolkata
        {"start": (28.61, 77.20), "end": (27.17, 78.00)}  # Delhi to Agra
    ]
    
    data = []
    
    # PHASE 1: Generate 15,000 Urban Accidents
    hub_weights = [hub["weight"] for hub in hubs]
    for i in range(15000):
        hub = random.choices(hubs, weights=hub_weights, k=1)[0]
        lat = np.random.normal(hub["lat"], hub["spread"])
        lon = np.random.normal(hub["lon"], hub["spread"])
        severity = random.choices(['Fatal', 'Grievous Injury', 'Minor Damage'], weights=[10, 30, 60], k=1)[0]
        
        data.append({
            "Accident_ID": f"IND-{100000+i}",
            "Latitude": round(lat, 6), "Longitude": round(lon, 6),
            "Severity": severity, "Road_Type": "City Street"
        })
        
    # PHASE 2: Generate 10,000 Highway Accidents 
    for i in range(15000, 25000):
        corridor = random.choice(corridors)
        start_lat, start_lon = corridor["start"]
        end_lat, end_lon = corridor["end"]
        
        t = random.uniform(0.05, 0.95) 
        
        # Tightened the noise to 0.02 to keep them strictly on the highway paths
        lat = start_lat + t * (end_lat - start_lat) + np.random.normal(0, 0.02)
        lon = start_lon + t * (end_lon - start_lon) + np.random.normal(0, 0.02)
        severity = random.choices(['Fatal', 'Grievous Injury', 'Minor Damage'], weights=[25, 45, 30], k=1)[0]
        
        data.append({
            "Accident_ID": f"IND-{100000+i}",
            "Latitude": round(lat, 6), "Longitude": round(lon, 6),
            "Severity": severity, "Road_Type": "Highway Corridor"
        })
        
    df = pd.DataFrame(data)
    
    # Auto-save directly into the data/raw folder!
    base_dir = os.path.abspath(os.path.dirname(__file__))
    target_dir = os.path.join(base_dir, 'data', 'raw')
    os.makedirs(target_dir, exist_ok=True)
    
    filename = os.path.join(target_dir, "pan_india_accidents.csv")
    df.to_csv(filename, index=False)
    print(f"--- SUCCESS: Generated {len(df)} land-locked records in {filename} ---")

if __name__ == "__main__":
    generate_pan_india_data()