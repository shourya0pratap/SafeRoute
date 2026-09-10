import os
import time
import numpy as np
import pandas as pd
from sklearn.cluster import DBSCAN, KMeans
from sklearn.metrics import davies_bouldin_score, silhouette_score
from sklearn.preprocessing import StandardScaler

print("Loading 5,000 Gurugram traffic records...")
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
file_path = os.path.join(base_dir, 'data', 'raw', 'indian_road_accidents.csv')
df = pd.read_csv(file_path)

# Extract coordinates for clustering
coords = df[['Latitude', 'Longitude']].dropna().values
scaler = StandardScaler()
coords_scaled = scaler.fit_transform(coords)

results = []

# ==========================================
# MODEL 1: K-Means Clustering
# ==========================================
print("\nRunning K-Means (k=500)...")
start_time = time.time()

kmeans = KMeans(n_clusters=500, random_state=42, n_init=10)
kmeans_labels = kmeans.fit_predict(coords_scaled)

kmeans_time = time.time() - start_time
kmeans_sil = silhouette_score(coords_scaled, kmeans_labels)
kmeans_db = davies_bouldin_score(coords_scaled, kmeans_labels)

results.append({
    "Model": "K-Means (k=500)",
    "Time (sec)": round(kmeans_time, 4),
    "Clusters": 500,
    "Silhouette Score": round(kmeans_sil, 4),
    "Davies-Bouldin Index": round(kmeans_db, 4)
})

# ==========================================
# MODEL 2: DBSCAN
# ==========================================
print("Running DBSCAN...")
start_time = time.time()

dbscan = DBSCAN(eps=0.15, min_samples=4)
dbscan_labels = dbscan.fit_predict(coords_scaled)

dbscan_time = time.time() - start_time

core_samples_mask = dbscan_labels != -1
dbscan_clusters = len(set(dbscan_labels)) - (1 if -1 in dbscan_labels else 0)

if dbscan_clusters > 1:
    dbscan_sil = silhouette_score(coords_scaled[core_samples_mask], dbscan_labels[core_samples_mask])
    dbscan_db = davies_bouldin_score(coords_scaled[core_samples_mask], dbscan_labels[core_samples_mask])
else:
    dbscan_sil, dbscan_db = 0.0, 0.0

results.append({
    "Model": "DBSCAN",
    "Time (sec)": round(dbscan_time, 4),
    "Clusters": dbscan_clusters,
    "Silhouette Score": round(dbscan_sil, 4),
    "Davies-Bouldin Index": round(dbscan_db, 4)
})

# ==========================================
# PRINT MODEL COMPARISON TABLE
# ==========================================
print("\n" + "=" * 68)
print(f"{'Model':<18} | {'Clusters':<8} | {'Silhouette ⬆':<14} | {'Davies-Bouldin ⬇':<18} | {'Time (s)':<8}")
print("-" * 68)
for r in results:
    print(f"{r['Model']:<18} | {str(r['Clusters']):<8} | {str(r['Silhouette Score']):<14} | {str(r['Davies-Bouldin Index']):<18} | {str(r['Time (sec)']):<8}")
print("=" * 68)
print("* Silhouette Score: Higher is better (-1 to +1)")
print("* Davies-Bouldin Index: Lower is better (0 to infinity)")

# ==========================================
# DATASET REPRESENTATION BREAKDOWN (For Reviewer 2)
# ==========================================
print("\n" + "=" * 68)
print("DATASET REPRESENTATION ANALYSIS (FOR REVIEWER 2)")
print("=" * 68)

if 'Severity' in df.columns:
    print("\n--- Severity Distribution ---")
    print((df['Severity'].value_counts(normalize=True) * 100).round(2).astype(str).add('%').to_string())

if 'Road_Type' in df.columns:
    print("\n--- Road Type Distribution ---")
    print((df['Road_Type'].value_counts(normalize=True) * 100).round(2).astype(str).add('%').to_string())

if 'Weather' in df.columns:
    print("\n--- Weather Distribution ---")
    print((df['Weather'].value_counts(normalize=True) * 100).round(2).astype(str).add('%').to_string())

if 'Date' in df.columns:
    try:
        df['Month'] = pd.to_datetime(df['Date'], errors='coerce').dt.month_name()
        print("\n--- Monthly/Seasonal Distribution ---")
        print((df['Month'].value_counts(normalize=True) * 100).round(2).astype(str).add('%').to_string())
    except Exception as e:
        pass