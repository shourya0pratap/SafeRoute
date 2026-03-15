import pandas as pd
import os

def load_data(filepath):
    print(f"[*] Loading dataset from {filepath}...")
    try:
        df = pd.read_csv(filepath)
        return df
    except FileNotFoundError:
        print("[!] Error: File not found.")
        return None

def clean_coordinates(df):
    initial_count = len(df)
    df_clean = df.dropna(subset=['Latitude', 'Longitude'])
    df_clean.loc[:, 'Latitude'] = pd.to_numeric(df_clean['Latitude'], errors='coerce')
    df_clean.loc[:, 'Longitude'] = pd.to_numeric(df_clean['Longitude'], errors='coerce')
    df_clean = df_clean.dropna(subset=['Latitude', 'Longitude'])
    print(f"[*] Dropped {initial_count - len(df_clean)} rows with bad coordinates.")
    return df_clean

def normalize_data(df):
    # Map Kaggle numeric severities if they exist, otherwise fill unknowns
    severity_mapping = {1.0: 'Fatal', 2.0: 'Grievous Injury', 3.0: 'Minor Damage'}
    if 'Severity' in df.columns and df['Severity'].dtype == 'float64':
        df['Severity'] = df['Severity'].map(severity_mapping).fillna('Unknown')
    elif 'Severity' in df.columns:
         df['Severity'] = df['Severity'].fillna('Unknown')
    return df

def filter_city_limits(df, lat_bounds, lon_bounds):
    df_filtered = df[
        (df['Latitude'] >= lat_bounds[0]) & (df['Latitude'] <= lat_bounds[1]) &
        (df['Longitude'] >= lon_bounds[0]) & (df['Longitude'] <= lon_bounds[1])
    ]
    print(f"[*] Filtered dataset down to {len(df_filtered)} regional accidents.")
    return df_filtered

def run_cleaning_pipeline(input_file, output_file):
    df = load_data(input_file)
    if df is None: return
    df = clean_coordinates(df)
    df = normalize_data(df)
    
    # --- THE INDIA BOUNDING BOX ---
    india_lat_bounds = (8.0, 38.0)
    india_lon_bounds = (68.0, 98.0)
    df = filter_city_limits(df, india_lat_bounds, india_lon_bounds)
    
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    df.to_csv(output_file, index=False)
    print(f"--- SUCCESS: Cleaned data saved to {output_file} ---")

if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    
    raw_data_path = os.path.join(base_dir, 'data' , 'raw' , 'indian_accidents.csv') 
    processed_data_path = os.path.join(base_dir, 'data', 'processed', 'accidents_clean.csv')
    
    run_cleaning_pipeline(raw_data_path, processed_data_path)