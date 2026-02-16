import json
from typing import Dict, List

import requests

from .models import SongRecord


class OllamaClient:
    def __init__(self, host: str = "http://localhost:11434", timeout: int = 120):
        self.host = host.rstrip("/")
        self.timeout = timeout

    def list_models(self) -> List[str]:
        resp = requests.get(f"{self.host}/api/tags", timeout=self.timeout)
        resp.raise_for_status()
        models = resp.json().get("models", [])
        return [m.get("name", "") for m in models if m.get("name")]

    def recommend_best_model(self, models: List[str]) -> str:
        if not models:
            return ""
        priority = ["llama3.1", "llama3", "qwen2.5", "mistral", "mixtral", "phi4", "gemma2"]
        lower = {m.lower(): m for m in models}
        for p in priority:
            for name_l, original in lower.items():
                if p in name_l:
                    return original
        return models[0]

    def analyze_song(self, model: str, song: SongRecord, research_context: str) -> Dict:
        schema_hint = {
            "mood_primary": "sad|happy|melancholic|angry|nostalgic|hype|romantic|mixed",
            "mood_scores": {
                "sad": 0.0,
                "happy": 0.0,
                "melancholic": 0.0,
                "angry": 0.0,
                "nostalgic": 0.0,
                "hype": 0.0,
                "romantic": 0.0,
                "mixed": 0.0,
            },
            "themes": ["string"],
            "song_summary": "2-4 sentence summary",
            "deep_analysis": "Long detailed paragraph(s) explaining likely content and tone.",
            "confidence": 0.0,
        }

        prompt = f"""
You are analyzing Juice WRLD songs for playlist metadata.
Return ONLY strict JSON with this schema (no markdown):
{json.dumps(schema_hint, indent=2)}

Song metadata:
- title: {song.name}
- category: {song.category}
- era: {song.era_name}
- artists: {song.credited_artists}
- producers: {song.producers}
- release_date: {song.release_date}
- length: {song.length}
- track_titles: {song.track_titles}
- additional_information: {song.additional_information}
- notes: {song.notes[:1500]}
- lyrics_excerpt: {song.lyrics[:1800]}

Web context (no-key search snippets):
{research_context[:3000]}

Instructions:
- Be explicit but do not fabricate certainty; include uncertainty in confidence.
- Keep mood_scores between 0 and 1.
- themes should be concise tags.
""".strip()

        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "options": {"temperature": 0.2},
        }
        resp = requests.post(f"{self.host}/api/generate", json=payload, timeout=self.timeout)
        resp.raise_for_status()
        raw = resp.json().get("response", "{}").strip()

        parsed = json.loads(raw)
        parsed["raw_model_output"] = raw
        return parsed
