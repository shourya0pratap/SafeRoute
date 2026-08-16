# 🛡️ SafeRoute: Real-Time Road Accident Hotspot Detection

SafeRoute is a safety-first navigation dashboard and ML pipeline that evaluates route risk using historical crash hotspots and live hazard reports.

## Tech Stack

- Python 3.11+
- Flask + Gunicorn
- Pandas, NumPy, Scikit-learn
- SQLite
- Leaflet.js + OSRM

## Local Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run.py
```

## Production Runtime

Run with Gunicorn (WSGI entrypoint):

```bash
gunicorn --workers 4 --bind 0.0.0.0:5000 wsgi:app
```

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `FLASK_DEBUG` | Enable debug mode | `false` |
| `HOST` | Flask bind host | `0.0.0.0` |
| `PORT` | Flask/Gunicorn port | `5000` |
| `SECRET_KEY` | Flask secret key | `unsafe-dev-secret-change-me` |
| `SAFEROUTE_DATA_DIR` | Base data directory | `<repo>/data` |
| `SAFEROUTE_CLUSTERS_FILE` | Active clusters CSV path | `<data>/processed/cluster_centroids.csv` |
| `SAFEROUTE_LIVE_DB_PATH` | SQLite live reports path | `<data>/live_reports.db` |
| `SAFEROUTE_ROUTE_MAX_WAYPOINTS` | Max waypoints accepted by `/api/evaluate_route` | `500` |
| `SAFEROUTE_REPORT_RATE_LIMIT_WINDOW_SECONDS` | Report rate-limit window | `60` |
| `SAFEROUTE_REPORT_RATE_LIMIT_MAX_REQUESTS` | Max report requests per IP in window | `20` |
| `SAFEROUTE_REQUIRE_REPORT_API_KEY` | Require API key on `/api/report` | `false` |
| `SAFEROUTE_REPORT_API_KEY` | API key value when enabled | empty |
| `SAFEROUTE_ENFORCE_HTTPS` | Reject non-HTTPS API requests | `false` |

## Data + Model Pipeline

Run a versioned pipeline:

```bash
python -m src.pipeline_runner --k 500
```

- Writes cleaned data to `data/processed/accidents_clean.csv`
- Writes versioned centroids to `data/processed/versions/`
- Promotes active centroids to `data/processed/cluster_centroids.csv`
- Stores run metadata in `data/processed/model_manifest.json`

Rollback to a previous model file:

```bash
python -m src.pipeline_runner --rollback data/processed/versions/cluster_centroids_<VERSION>.csv
```

## Testing and CI

Run tests:

```bash
pytest -q
```

CI workflow (`.github/workflows/ci.yml`) runs:
- Unit/integration tests
- Dependency vulnerability audit (`pip-audit`)

## Release Checklist (v1)

- [ ] Define launch region and target traffic assumptions
- [ ] Set production environment variables and secrets
- [ ] Run versioned model pipeline and verify output quality
- [ ] Enable HTTPS at load balancer/reverse proxy
- [ ] Set API abuse controls (`SAFEROUTE_REQUIRE_REPORT_API_KEY`, rate limits)
- [ ] Deploy behind Gunicorn + reverse proxy
- [ ] Verify `/healthz` and monitoring dashboards
- [ ] Run CI and confirm all checks pass
- [ ] Perform staged rollout and monitor error/latency metrics

## API Endpoints

- `GET /healthz`
- `GET /api/clusters`
- `POST /api/evaluate_route`
- `POST /api/report`
- `GET /api/live_reports`
