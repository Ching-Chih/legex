import os
import requests
from dotenv import load_dotenv
from pathlib import Path

# Load backend/.env explicitly (works regardless of where you run from)
ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(ENV_PATH)

BASE_URL = "https://rebrickable.com/api/v3/lego"


def _headers() -> dict:
    api_key = os.getenv("REBRICKABLE_API_KEY")
    if not api_key:
        raise RuntimeError("Missing REBRICKABLE_API_KEY in backend/.env")
    return {"Authorization": f"key {api_key}"}


def search_sets(query: str, page_size: int = 20) -> dict:
    url = f"{BASE_URL}/sets/"
    params = {"search": query, "page_size": page_size}
    r = requests.get(url, headers=_headers(), params=params, timeout=15)
    r.raise_for_status()
    return r.json()


def get_set(set_num: str) -> dict:
    url = f"{BASE_URL}/sets/{set_num}/"
    r = requests.get(url, headers=_headers(), timeout=15)
    r.raise_for_status()
    return r.json()