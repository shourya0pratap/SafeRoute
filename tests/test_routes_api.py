from pathlib import Path

import pandas as pd
import pytest

from app import app
from app.routes import init_db


@pytest.fixture()
def client(tmp_path):
    app.config.update(
        TESTING=True,
        ENFORCE_HTTPS=False,
        LIVE_REPORTS_DB_PATH=tmp_path / "live_reports.db",
        CLUSTERS_FILE=tmp_path / "cluster_centroids.csv",
        REPORT_RATE_LIMIT_WINDOW_SECONDS=60,
        REPORT_RATE_LIMIT_MAX_REQUESTS=50,
        REQUIRE_REPORT_API_KEY=False,
    )
    init_db()

    return app.test_client()


def test_healthz(client):
    response = client.get("/healthz")
    assert response.status_code == 200
    payload = response.get_json()
    assert payload["status"] == "ok"


def test_report_requires_valid_coordinates(client):
    response = client.post(
        "/api/report",
        json={"lat": 181, "lon": 70.0, "type": "Accident"},
    )
    assert response.status_code == 400


def test_report_and_list_live_reports(client):
    report_response = client.post(
        "/api/report",
        json={"lat": 12.9716, "lon": 77.5946, "type": "Traffic Jam"},
    )
    assert report_response.status_code == 201

    list_response = client.get("/api/live_reports")
    assert list_response.status_code == 200
    reports = list_response.get_json()
    assert len(reports) == 1
    assert reports[0]["type"] == "Traffic Jam"


def test_evaluate_route_validates_payload(client):
    response = client.post("/api/evaluate_route", json={"waypoints": []})
    assert response.status_code == 400


def test_evaluate_route_success(client):
    clusters_path = Path(app.config["CLUSTERS_FILE"])
    df = pd.DataFrame(
        [
            {
                "Cluster_ID": 1,
                "Latitude": 12.9716,
                "Longitude": 77.5946,
                "Total_Crashes": 10,
                "Risk_Level": "Moderate",
            }
        ]
    )
    df.to_csv(clusters_path, index=False)

    response = client.post(
        "/api/evaluate_route",
        json={"waypoints": [{"lat": 12.9716, "lon": 77.5946}]},
    )
    assert response.status_code == 200
    payload = response.get_json()
    assert payload["penalty_score"] >= 25
