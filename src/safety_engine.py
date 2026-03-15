import math
import pandas as pd

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculates the great-circle distance between two GPS points in meters.
    """
    R = 6371000  # Radius of Earth in meters
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi / 2.0)**2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2.0)**2
        
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance_meters = R * c
    return distance_meters

def calculate_route_risk(route_waypoints, centroids_df, live_reports=[], danger_radius_meters=500):
    """
    Evaluates a route's safety by checking for intersections with 
    historical Black Spots AND live crowdsourced reports.
    """
    total_risk_penalty = 0
    encountered_spots = set()
    encountered_live = set()
    
    # Loop through every point on the route
    for point in route_waypoints:
        route_lat, route_lon = point['lat'], point['lon']
        
        # 1. Check Historical Black Spots (from CSV)
        for index, row in centroids_df.iterrows():
            cluster_id = row['Cluster_ID']
            if cluster_id in encountered_spots: continue
                
            dist = haversine_distance(route_lat, route_lon, row['Latitude'], row['Longitude'])
            if dist <= danger_radius_meters:
                encountered_spots.add(cluster_id)
                if row['Risk_Level'] == 'High': total_risk_penalty += 45
                elif row['Risk_Level'] == 'Moderate': total_risk_penalty += 25
                else: total_risk_penalty += 5
                    
        # 2. Check Live User Reports (from SQLite)
        for idx, report in enumerate(live_reports):
            if idx in encountered_live: continue
                
            dist = haversine_distance(route_lat, route_lon, report['lat'], report['lon'])
            if dist <= danger_radius_meters:
                encountered_live.add(idx)
                # Live hazards are immediate dangers, heavily penalize them!
                total_risk_penalty += 75 
                
    return total_risk_penalty, len(encountered_spots), len(encountered_live)

