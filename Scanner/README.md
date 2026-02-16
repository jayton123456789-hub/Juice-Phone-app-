# Scanner (CLI)

Standalone CLI for building a large Juice WRLD song metadata dataset using:
1. Juice WRLD API data (`https://juicewrldapi.com/juicewrld`)
2. No-key web context snippets (DuckDuckGo Instant Answer)
3. **Your local Ollama models** for mood/theme/deep analysis

This does **not** modify the desktop app. It is fully isolated in `Scanner/`.

## Quick start

```bash
cd Scanner
python -m venv .venv
source .venv/bin/activate  # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Find your local Ollama models

PowerShell:

```powershell
ollama list
python -m scanner.main list-models
```

`list-models` will mark the recommended model from what you already have.

## Run scan

From repo root:

```bash
python -m Scanner.scanner.main scan --model auto --output-dir Scanner/data
```

Useful options:

```bash
# quick smoke test
python -m Scanner.scanner.main scan --max-songs 25

# only released songs
python -m Scanner.scanner.main scan --category released

# specific model
python -m Scanner.scanner.main scan --model llama3.1:8b

# reprocess everything regardless of checkpoint
python -m Scanner.scanner.main scan --force
```

## Outputs

- `Scanner/data/enriched/songs_enriched.jsonl` (append-only per-song results)
- `Scanner/data/exports/juicewrld_song_metadata.csv` (new rows for current run)
- `Scanner/data/checkpoints/scan_checkpoint.json` (resume support)

## Notes

- No API keys required.
- The full corpus can be large; run in long sessions.
- For best quality, use your strongest local model (typically Llama 3.1 / Qwen 2.5 / Mixtral if available).
