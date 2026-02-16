# Scanner (CLI)

Standalone CLI for building a large Juice WRLD song metadata dataset using:
1. Juice WRLD API data (`https://juicewrldapi.com/juicewrld`)
2. No-key web context snippets (DuckDuckGo Instant Answer)
3. **Your local Ollama models** for mood/theme/deep analysis

This does **not** modify the desktop app. It is fully isolated in `Scanner/`.

## Windows easiest option (recommended)

From File Explorer or terminal, open `Scanner/run_scanner.bat`.

That BAT file will:
- create `.venv` if missing,
- install dependencies,
- let you choose list-models / quick scan / full scan,
- write output to `Scanner/data`.

## Manual setup (PowerShell)

```powershell
cd C:\path\to\WRLD-Player-Desktop\Scanner
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

> In PowerShell, use `.\.venv\Scripts\Activate.ps1` (not `source ...`).

## Find your local Ollama models

Run inside `Scanner/`:

```powershell
ollama list
python -m scanner.main list-models
# (also works): python -m scanner list-models
```

`list-models` marks the recommended model from what you already have.

## Run scan

### If your terminal is inside `Scanner/`

```powershell
python -m scanner.main scan --model auto --output-dir data
# (also works): python -m scanner scan --model auto --output-dir data
```

### If your terminal is at repo root (`WRLD-Player-Desktop`)

```powershell
python -m Scanner.scanner.main scan --model auto --output-dir Scanner/data
```

Useful options:

```powershell
# quick smoke test
python -m scanner.main scan --max-songs 25 --output-dir data

# only released songs
python -m scanner.main scan --category released --output-dir data

# specific model
python -m scanner.main scan --model llama3.1:8b --output-dir data

# reprocess everything regardless of checkpoint
python -m scanner.main scan --force --output-dir data
```

## Outputs

- `Scanner/data/enriched/songs_enriched.jsonl` (append-only per-song results)
- `Scanner/data/exports/juicewrld_song_metadata.csv` (new rows for current run)
- `Scanner/data/checkpoints/scan_checkpoint.json` (resume support)

## Notes

- No API keys required.
- The full corpus can be large; run in long sessions.
- For best quality, use your strongest local model (typically Llama 3.1 / Qwen 2.5 / Mixtral if available).
