import pandas as pd
import os

def load_data(filepath):
    """Loads raw accident data and standardizes Kaggle column names."""
    print(f"[*] Loading massive dataset from {filepath} (This might take a minute)...")
    try:
        df = pd.read_csv(filepath)
        
        # Rename columns to match what our ML model expects
        df = df.rename(columns={
            'latitude': 'Latitude',
            'longitude': 'Longitude',
            'Accident_Severity': 'Severity'
        })
        return df
    except FileNotFoundError:
        print("[!] Error: File not found.")
        return None

def clean_coordinates(df):
    """Removes records missing crucial geospatial coordinates."""
    initial_count = len(df)
    df_clean = df.dropna(subset=['Latitude', 'Longitude'])
    
    # Ensure coordinates are numeric
    df_clean.loc[:, 'Latitude'] = pd.to_numeric(df_clean['Latitude'], errors='coerce')
    df_clean.loc[:, 'Longitude'] = pd.to_numeric(df_clean['Longitude'], errors='coerce')
    df_clean = df_clean.dropna(subset=['Latitude', 'Longitude'])
    
    dropped = initial_count - len(df_clean)
    print(f"[*] Dropped {dropped} rows missing or having invalid coordinates.")
    return df_clean

def normalize_data(df):
    """Translates numeric severity codes into text for the ML weighted scoring."""
    # In these datasets: 1 = Fatal, 2 = Serious/Grievous, 3 = Slight/Minor
    severity_mapping = {
        1.0: 'Fatal',
        2.0: 'Grievous Injury',
        3.0: 'Minor Damage'
    }
    
    if 'Severity' in df.columns:
        df['Severity'] = df['Severity'].map(severity_mapping).fillna('Unknown')
        print("[*] Mapped numeric Accident_Severity to Text labels.")
        
    return df

def filter_city_limits(df, lat_bounds, lon_bounds):
    """Filters out coordinate outliers to isolate ONE city (prevents RAM crashes)."""
    df_filtered = df[
        (df['Latitude'] >= lat_bounds[0]) & (df['Latitude'] <= lat_bounds[1]) &
        (df['Longitude'] >= lon_bounds[0]) & (df['Longitude'] <= lon_bounds[1])
    ]
    
    print(f"[*] Filtered dataset down to {len(df_filtered)} regional accidents for processing.")
    return df_filtered

def run_cleaning_pipeline(input_file, output_file):
    """Executes the full data science lifecycle for preprocessing."""
    df = load_data(input_file)
    if df is None:
        return

    print(f"--- Initial Dataset Size: {df.shape} ---")
    df = clean_coordinates(df)
    df = normalize_data(df)
    
    # FILTER FOR DELHI NCR BOUNDING BOX
    # If you want to analyze the Andhra Pradesh data instead, change these!
    delhi_lat_bounds = (28.40, 28.88)
    delhi_lon_bounds = (76.83, 77.34)
    df = filter_city_limits(df, delhi_lat_bounds, delhi_lon_bounds)
    
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    df.to_csv(output_file, index=False)
    print(f"--- SUCCESS: Cleaned regional data saved to {output_file} ---")
    return df

if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    
    # Point this directly to the file you just uploaded!
    raw_data_path = os.path.join(base_dir, 'AccidentsBig.csv') 
    processed_data_path = os.path.join(base_dir, 'data', 'processed', 'accidents_clean.csv')
    
    run_cleaning_pipeline(raw_data_path, processed_data_path)