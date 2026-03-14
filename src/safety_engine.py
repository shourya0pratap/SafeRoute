import math
import pandas as pd

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculates the great-circle distance between two GPS points in meters.
    This is much more accurate than straight-line Euclidean distance on a globe.
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

def calculate_route_risk(route_waypoints, centroids_df, danger_radius_meters=500):
    """
    Evaluates a route's safety by checking for intersections with Black Spots.
    """
    total_risk_penalty = 0
    encountered_spots = set() # Prevent counting the same cluster twice
    
    # Loop through every point on the route
    for point in route_waypoints:
        route_lat, route_lon = point['lat'], point['lon']
        
        # Check distance against every known Black Spot
        for index, row in centroids_df.iterrows():
            cluster_id = row['Cluster_ID']
            
            # Skip if we already penalized the route for this specific cluster
            if cluster_id in encountered_spots:
                continue
                
            dist = haversine_distance(route_lat, route_lon, row['Latitude'], row['Longitude'])
            
            # If the route waypoint falls inside the Black Spot radius
            if dist <= danger_radius_meters:
                encountered_spots.add(cluster_id)
                
                # Apply penalty based on ML Risk Level
                if row['Risk_Level'] == 'High':
                    total_risk_penalty += 50
                elif row['Risk_Level'] == 'Moderate':
                    total_risk_penalty += 20
                else:
                    total_risk_penalty += 5
                    
    return total_risk_penalty, len(encountered_spots)

# Example Usage for your backend:
# penalty_score, spots_hit = calculate_route_risk(osrm_route_data, pd.read_csv('cluster_centroids.csv'))