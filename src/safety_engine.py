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

def calculate_route_risk(route_waypoints, centroids_df, live_reports=[], live_danger_radius=1000):
    total_risk_penalty = 0
    encountered_spots = set()
    encountered_live = set()
    
    clusters = centroids_df.to_dict('records')
    
    for point in route_waypoints:
        try:
            route_lat, route_lon = float(point['lat']), float(point['lon'])
        except (KeyError, TypeError, ValueError):
            continue 
        
        # 1. Historical Black Spots (DYNAMIC RADIUS)
        for row in clusters:
            spot_key = row.get('Cluster_ID', clusters.index(row))
            if spot_key in encountered_spots: 
                continue
            
            # THE NEW MATH: Exactly mirrors the JavaScript!
            crashes = int(row.get('Total_Crashes', 1))
            cluster_radius_meters = 300 + (crashes * 50)
                
            dist = haversine_distance(route_lat, route_lon, float(row['Latitude']), float(row['Longitude']))
            
            # Now it only triggers if it actually touches the custom circle size
            if dist <= cluster_radius_meters:
                encountered_spots.add(spot_key)
                
                risk = str(row.get('Risk_Level', 'Low'))
                if risk == 'High': total_risk_penalty += 45
                elif risk == 'Moderate': total_risk_penalty += 25
                else: total_risk_penalty += 5
                    
        # 2. Live User Reports (STATIC RADIUS)
        for idx, report in enumerate(live_reports):
            if idx in encountered_live: continue
                
            dist = haversine_distance(route_lat, route_lon, float(report['lat']), float(report['lon']))
            
            # Live reports don't have "Total Crashes" yet, so they use the static live_danger_radius
            if dist <= live_danger_radius:
                encountered_live.add(idx)
                if report.get('type') == 'Traffic Jam':
                    total_risk_penalty += 30
                else:
                    total_risk_penalty += 75 
                
    return total_risk_penalty, len(encountered_spots), len(encountered_live)