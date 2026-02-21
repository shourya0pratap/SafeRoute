import folium
from folium.plugins import HeatMap
import os

def generate_safe_route_map():
    print("Initializing SafeRoute Map...")

    # 1. Base Map Setup
    # Centered around Delhi/Gurugram. 
    # 'CartoDB dark_matter' gives it that cool, dark-mode tech vibe.
    m = folium.Map(location=[28.5500, 77.2000], zoom_start=11, tiles='CartoDB dark_matter')

    # 2. Dummy Data: Raw Accident Coordinates (What Pandas will give you)
    # Format: [Latitude, Longitude, Weight/Severity]
    accident_data = [
        [28.6139, 77.2090, 0.8], [28.6145, 77.2085, 0.6], [28.6120, 77.2100, 0.9], # Connaught Place area
        [28.4595, 77.0266, 0.9], [28.4600, 77.0250, 0.7], [28.4580, 77.0270, 0.8], # Gurugram area
        [28.5355, 77.3910, 0.7], [28.5360, 77.3900, 0.5], [28.5340, 77.3920, 0.6], # Noida area
        [28.7041, 77.1025, 0.9], [28.7050, 77.1000, 0.8]                           # Rohini area
    ]

    # 3. Add HeatMap Layer
    # This visualizes the general density of accidents
    HeatMap(
        accident_data,
        radius=25,
        blur=15,
        gradient={0.4: 'blue', 0.6: 'lime', 0.8: 'yellow', 1.0: 'red'}
    ).add_to(m)

    # 4. Dummy Data: K-Means Centroids (What Scikit-Learn will give you)
    # These represent the absolute center of the "Black Spots"
    black_spots = [
        {"lat": 28.6139, "lng": 77.2090, "risk": "High", "crashes": 45, "name": "Rajiv Chowk Intersection"},
        {"lat": 28.4595, "lng": 77.0266, "risk": "High", "crashes": 38, "name": "Cyber City Corridor"},
        {"lat": 28.5355, "lng": 77.3910, "risk": "Moderate", "crashes": 12, "name": "Sector 18 Market"}
    ]

    # 5. Add Interactive Markers for the Black Spots
    for spot in black_spots:
        # Determine color based on risk
        marker_color = 'red' if spot['risk'] == 'High' else 'orange'
        
        # HTML for the popup box
        popup_html = f"""
        <div style="font-family: 'Inter', sans-serif; min-width: 150px;">
            <h4 style="margin: 0; color: #333;">{spot['name']}</h4>
            <p style="margin: 5px 0; color: {marker_color}; font-weight: bold;">{spot['risk']} Risk Zone</p>
            <p style="margin: 0; font-size: 12px; color: #666;">Total Recorded Crashes: {spot['crashes']}</p>
        </div>
        """

        folium.CircleMarker(
            location=[spot["lat"], spot["lng"]],
            radius=12,
            color=marker_color,
            fill=True,
            fill_color=marker_color,
            fill_opacity=0.6,
            popup=folium.Popup(popup_html, max_width=250),
            tooltip="Click for Risk Data"
        ).add_to(m)

    # 6 Save the map as an HTML file  
    # 6.a Get the path to the folder where this python script is located (src/)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 6.b Tell it to go UP one folder (..), then INTO 'app', then INTO 'templates'
    save_dir = os.path.join(script_dir, '..', 'app', 'templates')
    
    # 6.c Create the final file path
    file_path = os.path.join(save_dir, 'map.html')
    
    # 6.d Save the map there!
    m.save(file_path)
    
    print(f"Map successfully generated and saved to: {file_path}")

if __name__ == "__main__":
    generate_safe_route_map()