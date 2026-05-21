from __future__ import annotations

from pathlib import Path
import yaml


ROOT_DIR = Path(__file__).resolve().parents[1]
DEFAULT_RUBRIC_PATH = ROOT_DIR / "config" / "scoring_rubric.yaml"


def load_scoring_rubric(path: Path = DEFAULT_RUBRIC_PATH) -> dict:
    with path.open("r", encoding="utf-8") as file:
        return yaml.safe_load(file)
