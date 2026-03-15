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

def calculate_route_risk(route_waypoints, centroids_df, live_reports=[], danger_radius_meters=3000):
    total_risk_penalty = 0
    encountered_spots = set()
    encountered_live = set()
    
    # Pre-convert centroids to a list of dicts to speed up the loop and ensure floats
    clusters = centroids_df.to_dict('records')
    
    for point in route_waypoints:
        # FORCE FLOAT CASTING - This is usually the culprit
        try:
            route_lat = float(point['lat'])
            route_lon = float(point['lon'])
        except (KeyError, TypeError, ValueError):
            continue # Skip malformed points
        
        # 1. Historical Black Spots
        for row in clusters:
            # Use a combination of Index and ID to ensure uniqueness
            spot_key = row.get('Cluster_ID', clusters.index(row))
            
            if spot_key in encountered_spots: 
                continue
                
            dist = haversine_distance(route_lat, route_lon, float(row['Latitude']), float(row['Longitude']))
            
            if dist <= danger_radius_meters:
                encountered_spots.add(spot_key)
                
                # Check Risk_Level and apply penalty [cite: 177]
                risk = str(row.get('Risk_Level', 'Low'))
                if risk == 'High': total_risk_penalty += 45
                elif risk == 'Moderate': total_risk_penalty += 25
                else: total_risk_penalty += 5
    
    # (Live reports loop remains the same but ensure it uses independent indentation)
    return total_risk_penalty, len(encountered_spots), len(encountered_live)