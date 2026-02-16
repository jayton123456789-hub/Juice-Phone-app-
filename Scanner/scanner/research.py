from typing import Dict, List
from urllib.parse import quote_plus

import requests


class WebResearch:
    """No-key research via DuckDuckGo Instant Answer API."""

    def __init__(self, timeout: int = 20):
        self.timeout = timeout

    def search_song(self, title: str, artist: str = "Juice WRLD") -> Dict:
        query = f"{title} {artist} song meaning mood lyrics"
        url = f"https://api.duckduckgo.com/?q={quote_plus(query)}&format=json&no_redirect=1&no_html=1"
        try:
            resp = requests.get(url, timeout=self.timeout)
            resp.raise_for_status()
            data = resp.json()
        except Exception:
            return {"context": "", "links": []}

        snippets: List[str] = []
        links: List[str] = []

        abstract = data.get("AbstractText")
        abstract_url = data.get("AbstractURL")
        if abstract:
            snippets.append(abstract)
        if abstract_url:
            links.append(abstract_url)

        for topic in data.get("RelatedTopics", [])[:8]:
            if isinstance(topic, dict):
                text = topic.get("Text")
                first_url = topic.get("FirstURL")
                if text:
                    snippets.append(text)
                if first_url:
                    links.append(first_url)

        return {
            "context": "\n".join(snippets[:12]),
            "links": list(dict.fromkeys(links))[:12],
        }
