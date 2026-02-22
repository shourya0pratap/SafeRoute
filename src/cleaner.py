import pandas as pd
import numpy as np
import os

def load_data(filepath):
    """Loads raw accident data from a CSV file."""
    print(f"[*] Loading data from {filepath}...")
    try:
        df = pd.read_csv(filepath)
        return df
    except FileNotFoundError:
        print("[!] Error: File not found. Please ensure the raw CSV is in the data/raw/ folder.")
        return None

def clean_coordinates(df):
    """Removes records missing crucial geospatial coordinates."""
    initial_count = len(df)
    
    # Drop rows where Latitude or Longitude is NaN
    df_clean = df.dropna(subset=['Latitude', 'Longitude'])
    
    # Ensure coordinates are numeric
    df_clean['Latitude'] = pd.to_numeric(df_clean['Latitude'], errors='coerce')
    df_clean['Longitude'] = pd.to_numeric(df_clean['Longitude'], errors='coerce')
    df_clean = df_clean.dropna(subset=['Latitude', 'Longitude'])
    
    dropped = initial_count - len(df_clean)
    print(f"[*] Dropped {dropped} rows missing or having invalid coordinates.")
    return df_clean

def normalize_datetime(df):
    """Normalizes date and time formats."""
    # Convert 'Date' column to a standard datetime format
    if 'Date' in df.columns:
        df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
        print("[*] Normalized 'Date' column.")
    
    # Fill missing severity with a default value to prevent algorithm crashes
    if 'Severity' in df.columns:
        df['Severity'] = df['Severity'].fillna('Unknown')
        print("[*] Handled missing values in 'Severity' column.")
        
    return df

def filter_city_limits(df, lat_bounds, lon_bounds):
    """Filters out coordinate outliers that fall outside the target city limits."""
    df_filtered = df[
        (df['Latitude'] >= lat_bounds[0]) & (df['Latitude'] <= lat_bounds[1]) &
        (df['Longitude'] >= lon_bounds[0]) & (df['Longitude'] <= lon_bounds[1])
    ]
    
    outliers = len(df) - len(df_filtered)
    print(f"[*] Filtered {outliers} geographic outliers. Rows remaining: {len(df_filtered)}")
    return df_filtered

def run_cleaning_pipeline(input_file, output_file):
    """Executes the full data science lifecycle for preprocessing."""
    df = load_data(input_file)
    if df is None:
        return

    print(f"--- Initial Dataset Size: {df.shape} ---")
    
    # 1. Clean Coordinates
    df = clean_coordinates(df)
    
    # 2. Normalize Data
    df = normalize_datetime(df)
    
    # 3. Filter Outliers (Example: Bounding box for Delhi NCR)
    # Latitude ranges roughly 28.40 to 28.88, Longitude 76.83 to 77.34
    delhi_lat_bounds = (28.40, 28.88)
    delhi_lon_bounds = (76.83, 77.34)
    df = filter_city_limits(df, delhi_lat_bounds, delhi_lon_bounds)
    
    # 4. Save processed data
    # Ensure output directory exists before saving
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    df.to_csv(output_file, index=False)
    print(f"--- SUCCESS: Cleaned data saved to {output_file} ---")
    return df

if __name__ == "__main__":
    # Dynamically set file paths based on the repo structure
    # This grabs the path of src/ and steps back one folder to the root
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    
    # Input: The messy file you downloaded from OGD/Kaggle
    raw_data_path = os.path.join(base_dir, 'data', 'raw', 'accidents_raw.csv')
    
    # Output: The clean file your ML Engineer will use
    processed_data_path = os.path.join(base_dir, 'data', 'processed', 'accidents_clean.csv')
    
    # Run the pipeline
    run_cleaning_pipeline(raw_data_path, processed_data_path)