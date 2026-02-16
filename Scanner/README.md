# Scanner (CLI)

Standalone CLI for building a large Juice WRLD song metadata dataset using:
1. Juice WRLD API data (`https://juicewrldapi.com/juicewrld`)
2. No-key web context snippets (DuckDuckGo Instant Answer)
3. **Your local Ollama models** for mood/theme/deep analysis

This does **not** modify the desktop app. It is fully isolated in `Scanner/`.

## Windows: fastest path (recommended)

1. Open the repo folder in Explorer.
2. Open `Scanner`.
3. Double-click `run_scanner.bat`.

The BAT helper automatically:
- creates `.venv` if missing,
- upgrades `pip`,
- installs dependencies,
- gives you a simple menu (list models / quick scan / full scan / released-only / custom model),
- writes outputs to `Scanner\data`.

## Manual setup (PowerShell)

> Run these commands **inside the Scanner folder**.

```powershell
cd C:\path\to\WRLD-Player-Desktop\Scanner
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

PowerShell note: use `.\.venv\Scripts\Activate.ps1` style activation; do **not** use `source ...`.

## Find your local Ollama models

From inside `Scanner/`:

```powershell
ollama list
python -m scanner.main list-models
# also valid:
python -m scanner list-models
```

The tool will show all local models and mark a recommended one.

## Run a scan

### If terminal is inside `Scanner/` (most common)

```powershell
# auto-select best local model
python -m scanner.main scan --model auto --output-dir data

# quick smoke test
python -m scanner.main scan --max-songs 25 --model auto --output-dir data

# released songs only
python -m scanner.main scan --category released --model auto --output-dir data

# force reprocess even if checkpoint exists
python -m scanner.main scan --force --model auto --output-dir data
```

### If terminal is at repo root (`WRLD-Player-Desktop`)

```powershell
python -m Scanner.scanner.main scan --model auto --output-dir Scanner/data
```

## Common Windows errors (and fixes)

### `ModuleNotFoundError: No module named 'Scanner'`
You are likely running from inside `Scanner/` while using the repo-root command. Use:

```powershell
python -m scanner.main ...
```

### `source is not recognized`
`source` is a bash command, not PowerShell. Use:

```powershell
.\.venv\Scripts\Activate.ps1
```

### `Could not open requirements.txt`
You are not in the `Scanner/` directory. Run:

```powershell
cd C:\path\to\WRLD-Player-Desktop\Scanner
```

then retry.


### `Can not perform a --user install. User site-packages are not visible in this virtualenv.`
This means your machine has a global pip config forcing `--user` installs.
`run_scanner.bat` now bypasses that with isolated/no-user pip calls.

If you still hit it, inspect and remove the forcing config:

```powershell
py -m pip config list -v
py -m pip config unset global.user
```


## Outputs

- `Scanner/data/enriched/songs_enriched.jsonl` (append-only per-song records)
- `Scanner/data/exports/juicewrld_song_metadata.csv` (CSV export for spreadsheet tools)
- `Scanner/data/checkpoints/scan_checkpoint.json` (resume support)

## Notes

- No API keys required.
- Large full scans can take a while; checkpoints let you resume.
- Best quality is typically from your strongest local model (e.g., Llama 3.1 / Qwen / Mixtral if installed).
