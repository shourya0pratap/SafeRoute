import argparse
import json
import os
import shutil
from datetime import datetime, timezone
from pathlib import Path

from src.cleaner import run_cleaning_pipeline
from src.model import run_ml_pipeline


def _default_data_dir() -> Path:
    base_dir = Path(__file__).resolve().parent.parent
    return Path(os.getenv("SAFEROUTE_DATA_DIR", base_dir / "data"))


def _version_tag() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def run_versioned_pipeline(raw_input: Path, processed_dir: Path, k: int) -> Path:
    processed_dir.mkdir(parents=True, exist_ok=True)
    versions_dir = processed_dir / "versions"
    backups_dir = processed_dir / "backups"
    versions_dir.mkdir(parents=True, exist_ok=True)
    backups_dir.mkdir(parents=True, exist_ok=True)

    cleaned_output = processed_dir / "accidents_clean.csv"
    run_cleaning_pipeline(str(raw_input), str(cleaned_output))

    version = _version_tag()
    versioned_centroids = versions_dir / f"cluster_centroids_{version}.csv"
    current_centroids = processed_dir / "cluster_centroids.csv"

    run_ml_pipeline(str(cleaned_output), str(versioned_centroids), k=k)

    if current_centroids.exists():
        backup_path = backups_dir / f"cluster_centroids_backup_{version}.csv"
        shutil.copy2(current_centroids, backup_path)

    shutil.copy2(versioned_centroids, current_centroids)

    manifest_path = processed_dir / "model_manifest.json"
    manifest = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "version": version,
        "k": k,
        "raw_input": str(raw_input),
        "cleaned_output": str(cleaned_output),
        "active_centroids": str(current_centroids),
        "versioned_centroids": str(versioned_centroids),
    }
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"[+] Pipeline complete. Active model version: {version}")
    return versioned_centroids


def rollback_to_version(processed_dir: Path, version_file: Path) -> None:
    if not version_file.exists():
        raise FileNotFoundError(f"Versioned centroids not found: {version_file}")

    current_centroids = processed_dir / "cluster_centroids.csv"
    shutil.copy2(version_file, current_centroids)

    manifest_path = processed_dir / "model_manifest.json"
    manifest = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "rollback_from": str(version_file),
        "active_centroids": str(current_centroids),
    }
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"[+] Rollback complete. Active model: {version_file.name}")


def parse_args():
    parser = argparse.ArgumentParser(description="Run and version SafeRoute ML pipeline")
    parser.add_argument("--raw-input", type=Path, help="Path to raw accidents CSV")
    parser.add_argument("--processed-dir", type=Path, help="Directory for processed outputs")
    parser.add_argument("--k", type=int, default=500, help="KMeans cluster count")
    parser.add_argument(
        "--rollback",
        type=Path,
        help="Path to a versioned centroids CSV to make active",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    data_dir = _default_data_dir()

    raw_input = args.raw_input or data_dir / "raw" / "indian_road_accidents.csv"
    processed_dir = args.processed_dir or data_dir / "processed"

    if args.rollback:
        rollback_to_version(processed_dir, args.rollback)
        return

    run_versioned_pipeline(raw_input, processed_dir, args.k)


if __name__ == "__main__":
    main()
