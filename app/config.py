import os
from pathlib import Path


def _to_bool(value: str, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


class Config:
    BASE_DIR = Path(__file__).resolve().parent.parent
    DATA_DIR = Path(os.getenv("SAFEROUTE_DATA_DIR", BASE_DIR / "data"))

    DEBUG = _to_bool(os.getenv("FLASK_DEBUG"), default=False)
    SECRET_KEY = os.getenv("SECRET_KEY", "unsafe-dev-secret-change-me")
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", "5000"))

    CLUSTERS_FILE = Path(
        os.getenv("SAFEROUTE_CLUSTERS_FILE", DATA_DIR / "processed" / "cluster_centroids.csv")
    )
    LIVE_REPORTS_DB_PATH = Path(
        os.getenv("SAFEROUTE_LIVE_DB_PATH", DATA_DIR / "live_reports.db")
    )

    ROUTE_MAX_WAYPOINTS = int(os.getenv("SAFEROUTE_ROUTE_MAX_WAYPOINTS", "500"))
    REPORT_RATE_LIMIT_WINDOW_SECONDS = int(
        os.getenv("SAFEROUTE_REPORT_RATE_LIMIT_WINDOW_SECONDS", "60")
    )
    REPORT_RATE_LIMIT_MAX_REQUESTS = int(
        os.getenv("SAFEROUTE_REPORT_RATE_LIMIT_MAX_REQUESTS", "20")
    )

    REQUIRE_REPORT_API_KEY = _to_bool(
        os.getenv("SAFEROUTE_REQUIRE_REPORT_API_KEY"), default=False
    )
    REPORT_API_KEY = os.getenv("SAFEROUTE_REPORT_API_KEY", "")

    ENFORCE_HTTPS = _to_bool(os.getenv("SAFEROUTE_ENFORCE_HTTPS"), default=False)
