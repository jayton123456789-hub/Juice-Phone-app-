import argparse
import json
from pathlib import Path
from typing import Dict, List

from .juice_api import JuiceApiClient
from .ollama_client import OllamaClient
from .research import WebResearch
from .storage import append_jsonl, ensure_dirs, load_checkpoint, save_checkpoint, write_csv


def flatten_row(song, analysis: Dict, search: Dict, model: str) -> Dict:
    return {
        "song_id": song.id,
        "title": song.name,
        "category": song.category,
        "era": song.era_name,
        "artist": song.credited_artists,
        "producers": song.producers,
        "engineers": song.engineers,
        "track_titles": " | ".join(song.track_titles),
        "release_date": song.release_date,
        "leak_type": song.leak_type,
        "length": song.length,
        "lyrics": song.lyrics,
        "additional_information": song.additional_information,
        "notes": song.notes,
        "search_context": search.get("context", ""),
        "source_links": json.dumps(search.get("links", []), ensure_ascii=False),
        "mood_primary": analysis.get("mood_primary", "mixed"),
        "mood_scores": json.dumps(analysis.get("mood_scores", {}), ensure_ascii=False),
        "themes": json.dumps(analysis.get("themes", []), ensure_ascii=False),
        "song_summary": analysis.get("song_summary", ""),
        "deep_analysis": analysis.get("deep_analysis", ""),
        "confidence": analysis.get("confidence", 0),
        "model_name": model,
        "raw_model_output": analysis.get("raw_model_output", ""),
    }


def command_list_models(args) -> None:
    client = OllamaClient(host=args.ollama_host)
    models = client.list_models()
    if not models:
        print("No local Ollama models found.")
        return

    best = client.recommend_best_model(models)
    print("Local Ollama models:")
    for model in models:
        marker = "  <-- recommended" if model == best else ""
        print(f"- {model}{marker}")


def command_scan(args) -> None:
    output_dir = Path(args.output_dir)
    raw_dir = output_dir / "raw"
    enriched_dir = output_dir / "enriched"
    export_dir = output_dir / "exports"
    checkpoint_dir = output_dir / "checkpoints"
    ensure_dirs(raw_dir, enriched_dir, export_dir, checkpoint_dir)

    checkpoint_path = checkpoint_dir / "scan_checkpoint.json"
    processed_ids = load_checkpoint(checkpoint_path)

    api = JuiceApiClient(page_size=args.page_size)
    research = WebResearch()
    ollama = OllamaClient(host=args.ollama_host, timeout=args.ollama_timeout)

    if args.model == "auto":
        models = ollama.list_models()
        model = ollama.recommend_best_model(models)
        if not model:
            raise RuntimeError("No Ollama models available. Run `ollama list` first.")
    else:
        model = args.model

    print(f"Using Ollama model: {model}")

    rows: List[Dict] = []
    processed_since_checkpoint = 0

    songs_iter = api.iter_all_songs(
        category=args.category,
        era=args.era,
        include_details=not args.skip_details,
        max_songs=args.max_songs,
    )

    for song in songs_iter:
        if song.id in processed_ids and not args.force:
            continue

        search = research.search_song(song.name, song.credited_artists or "Juice WRLD")
        analysis = ollama.analyze_song(model=model, song=song, research_context=search.get("context", ""))
        row = flatten_row(song, analysis, search, model)

        append_jsonl(enriched_dir / "songs_enriched.jsonl", row)
        rows.append(row)

        processed_ids.add(song.id)
        processed_since_checkpoint += 1

        if processed_since_checkpoint >= args.checkpoint_every:
            save_checkpoint(checkpoint_path, processed_ids)
            processed_since_checkpoint = 0
            print(f"Checkpoint saved. Processed songs: {len(processed_ids)}")

    save_checkpoint(checkpoint_path, processed_ids)

    if rows:
        write_csv(export_dir / "juicewrld_song_metadata.csv", rows)

    print(f"Scan complete. New records this run: {len(rows)}")
    print(f"Checkpoint song count: {len(processed_ids)}")
    print(f"JSONL path: {enriched_dir / 'songs_enriched.jsonl'}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Juice WRLD song metadata scanner (CLI)")
    parser.add_argument("--ollama-host", default="http://localhost:11434", help="Ollama host URL")

    subparsers = parser.add_subparsers(dest="command", required=True)

    list_models = subparsers.add_parser("list-models", help="List local Ollama models and recommend best")
    list_models.set_defaults(func=command_list_models)

    scan = subparsers.add_parser("scan", help="Scan songs and build enriched dataset")
    scan.add_argument("--model", default="auto", help="Ollama model name or 'auto'")
    scan.add_argument("--output-dir", default="Scanner/data", help="Output data directory")
    scan.add_argument("--category", default="all", help="Filter category")
    scan.add_argument("--era", default="all", help="Filter era")
    scan.add_argument("--page-size", type=int, default=200, help="Juice API page size")
    scan.add_argument("--max-songs", type=int, default=None, help="Limit for testing")
    scan.add_argument("--checkpoint-every", type=int, default=20, help="Checkpoint frequency")
    scan.add_argument("--ollama-timeout", type=int, default=180, help="Ollama request timeout seconds")
    scan.add_argument("--skip-details", action="store_true", help="Skip per-song detail endpoint for faster run")
    scan.add_argument("--force", action="store_true", help="Reprocess songs even if checkpointed")
    scan.set_defaults(func=command_scan)

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
