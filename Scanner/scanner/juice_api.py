import time
from typing import Dict, Iterator, List, Optional

import requests

from .models import SongRecord

BASE_URL = "https://juicewrldapi.com/juicewrld"


class JuiceApiClient:
    def __init__(self, timeout: int = 30, page_size: int = 200, retry: int = 3):
        self.timeout = timeout
        self.page_size = page_size
        self.retry = retry

    def _get(self, path: str, params: Optional[Dict] = None) -> Dict:
        url = f"{BASE_URL}{path}"
        last_exc = None
        for attempt in range(1, self.retry + 1):
            try:
                resp = requests.get(url, params=params, timeout=self.timeout)
                resp.raise_for_status()
                return resp.json()
            except Exception as exc:
                last_exc = exc
                if attempt < self.retry:
                    time.sleep(attempt)
        raise RuntimeError(f"Failed GET {url}: {last_exc}")

    def get_stats(self) -> Dict:
        return self._get("/stats/")

    def iter_all_songs(
        self,
        category: Optional[str] = None,
        era: Optional[str] = None,
        include_details: bool = True,
        max_songs: Optional[int] = None,
    ) -> Iterator[SongRecord]:
        page = 1
        seen = 0
        while True:
            params = {"page": page, "page_size": self.page_size}
            if category and category.lower() != "all":
                params["category"] = category
            if era and era.lower() != "all":
                params["era"] = era

            payload = self._get("/songs/", params=params)
            results: List[Dict] = payload.get("results") or []
            if not results:
                break

            for song in results:
                if include_details:
                    song = self._get(f"/songs/{song['id']}/")
                yield SongRecord.from_api(song)
                seen += 1
                if max_songs and seen >= max_songs:
                    return

            if not payload.get("next"):
                break
            page += 1
