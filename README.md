# 🛡️ SafeRoute: Real-Time Road Accident Hotspot Detection

**SafeRoute** is a safety-first navigation dashboard and data science pipeline that prioritizes human life over travel speed. Traditional GPS applications route drivers through the fastest possible path, often sending them blindly through high-frequency accident zones. SafeRoute solves this by combining historical crash data, unsupervised machine learning, and real-time routing algorithms to suggest mathematically safer alternative detours.

Developed by **Team Error_Logical** as a B.Tech Computer Science and Engineering Minor Project.

---

## ✨ Key Features

- **Dynamic Spatial Bounding:** Replaces static radius checks with a dynamic mathematical footprint. The geographical collision radius of each danger zone scales linearly based on its historical accident density `(Base 300m + (Crashes × 50m))`.
- **Machine Learning Integration:** Utilizes **K-Means Clustering (k=500)** to group over 5,000 geocoded accident records into precise "macro-clusters" across the Indian subcontinent.
- **Safety-Aware Routing:** Intercepts the **OSRM (Open Source Routing Machine)** API to evaluate standard routes against known Black Spots using Haversine distance calculations.
- **Real-Time Hazard Crowdsourcing:** Features a live SQLite database allowing users to drop temporary pins for sudden hazards (Traffic Jams, Collisions, etc.), instantly updating the routing penalty engine.
- **Interactive Web UI:** Built with **Leaflet.js** and **Flask**, featuring a sleek dark-mode dashboard with bi-directional syncing (clicking map layers dynamically updates sidebar UI metrics).

---

## 🛠️ Tech Stack

**Backend & Data Science:**

- **Python 3.x:** Core pipeline logic.
- **Pandas & NumPy:** Data ingestion, coordinate validation, and mathematical modeling.
- **Scikit-Learn:** Unsupervised K-Means clustering.
- **Flask:** RESTful API server.
- **SQLite:** Lightweight database for live hazard crowdsourcing.

**Frontend:**

- **HTML5, CSS3, JavaScript (Vanilla):** Custom dashboard UI.
- **Leaflet.js & CARTO:** Map rendering and interactive geometry.
- **OSRM API:** Live GPS waypoints and turn-by-turn routing data.

---

## 📂 Project Structure

```text
SafeRoute/
│
├── app.py                     # Main Flask Application Server
├── fix_coastline.py           # Bounding-box script to correct oceanic GPS drift
├── static/
│   ├── style.css              # Dark-mode dashboard UI styles
│   ├── app.js                 # Leaflet map logic and OSRM integration
│   └── favicon.svg
├── templates/
│   ├── layout.html            # Base Jinja2 template
│   └── dashboard.html         # Main map interface
├── data/
│   ├── raw/                   # Unstructured & synthetic geocoded datasets
│   └── processed/             # Cleaned datasets and finalized cluster centroids
└── src/
    ├── cleaner.py             # Data preprocessing and null handling
    ├── model.py               # K-Means clustering engine
    └── safety_engine.py       # Haversine collision math and risk penalty calculator
```
