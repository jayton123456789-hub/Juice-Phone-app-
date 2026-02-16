from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class SongRecord:
    id: int
    name: str
    category: str
    era_name: str = ""
    credited_artists: str = ""
    producers: str = ""
    engineers: str = ""
    track_titles: List[str] = field(default_factory=list)
    lyrics: str = ""
    additional_information: str = ""
    notes: str = ""
    release_date: str = ""
    leak_type: str = ""
    length: str = ""

    @classmethod
    def from_api(cls, payload: Dict[str, Any]) -> "SongRecord":
        era = payload.get("era") or {}
        return cls(
            id=payload.get("id"),
            name=payload.get("name") or "Unknown",
            category=payload.get("category") or "unknown",
            era_name=era.get("name") or "",
            credited_artists=payload.get("credited_artists") or "",
            producers=payload.get("producers") or "",
            engineers=payload.get("engineers") or "",
            track_titles=payload.get("track_titles") or [],
            lyrics=payload.get("lyrics") or "",
            additional_information=payload.get("additional_information") or "",
            notes=payload.get("notes") or "",
            release_date=payload.get("release_date") or "",
            leak_type=payload.get("leak_type") or "",
            length=payload.get("length") or "",
        )


@dataclass
class EnrichedSong:
    song_id: int
    title: str
    category: str
    era: str
    artist: str
    producers: str
    mood_primary: str
    mood_scores: Dict[str, float]
    themes: List[str]
    song_summary: str
    deep_analysis: str
    confidence: float
    search_context: str
    source_links: List[str]
    model_name: str
    raw_model_output: str
