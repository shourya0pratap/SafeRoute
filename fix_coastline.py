import pandas as pd
import os

def nudge_points_inland():
    base_dir = os.path.abspath(os.path.dirname(__file__))
    file_path = os.path.join(base_dir, 'data', 'raw', 'indian_road_accidents.csv')
    
    print("[*] Loading the 5k dataset to fix the Southern Peninsula...")
    try:
        df = pd.read_csv(file_path)
    except FileNotFoundError:
        print(f"[!] Could not find {file_path}. Please ensure it is in the data/raw folder.")
        return

    fixed_count = 0
    
    for idx, row in df.iterrows():
        lat = row['Latitude']
        lon = row['Longitude']
        
        # Only apply the fix to the Southern Peninsula (Anything south of Mumbai/Pune lat ~19.0)
        if lat < 19.0:
            
            # --- WEST COAST FIX (Arabian Sea) ---
            # Rough mathematical line from Mumbai (19.0, 72.8) to Kanyakumari (8.0, 77.5)
            # Equation of the coastline: Min_Lon = 72.8 - 0.427 * (lat - 19.0)
            min_lon_for_lat = 72.8 - 0.427 * (lat - 19.0)
            if lon < min_lon_for_lat:
                df.at[idx, 'Longitude'] = min_lon_for_lat + 0.05 # Nudge 5km inland
                fixed_count += 1
                
            # --- EAST COAST FIX (Bay of Bengal) ---
            # Rough mathematical line from Vijayawada (16.5, 80.6) to Kanyakumari (8.0, 77.5)
            # Equation of the coastline: Max_Lon = 80.6 + 0.364 * (lat - 16.5)
            max_lon_for_lat = 80.6 + 0.364 * (lat - 16.5)
            if lon > max_lon_for_lat:
                df.at[idx, 'Longitude'] = max_lon_for_lat - 0.05 # Nudge 5km inland
                fixed_count += 1

    # Save it back to the exact same file
    df.to_csv(file_path, index=False)
    print(f"--- SUCCESS! Pulled {fixed_count} drowning accidents out of the ocean and back onto dry land! ---")

if __name__ == "__main__":
    nudge_points_inland()