import pandas as pd

from src.safety_engine import calculate_route_risk


def test_calculate_route_risk_with_cluster_and_live_report():
    waypoints = [{"lat": 12.9716, "lon": 77.5946}]
    clusters = pd.DataFrame(
        [
            {
                "Cluster_ID": 1,
                "Latitude": 12.9716,
                "Longitude": 77.5946,
                "Total_Crashes": 100,
                "Risk_Level": "High",
            }
        ]
    )
    live_reports = [{"lat": 12.9716, "lon": 77.5946, "type": "Traffic Jam"}]

    penalty, black_spots, live_hits = calculate_route_risk(waypoints, clusters, live_reports)

    assert penalty == 75
    assert black_spots == 1
    assert live_hits == 1


def test_calculate_route_risk_ignores_invalid_waypoints():
    clusters = pd.DataFrame(
        [
            {
                "Cluster_ID": 1,
                "Latitude": 12.9716,
                "Longitude": 77.5946,
                "Total_Crashes": 4,
                "Risk_Level": "Low",
            }
        ]
    )

    penalty, black_spots, live_hits = calculate_route_risk(
        [{"lat": "bad", "lon": 77.59}],
        clusters,
        [],
    )

    assert penalty == 0
    assert black_spots == 0
    assert live_hits == 0
