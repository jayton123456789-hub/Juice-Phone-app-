import csv
import json
from pathlib import Path
from typing import Dict, Iterable, List, Set


def ensure_dirs(*paths: Path) -> None:
    for path in paths:
        path.mkdir(parents=True, exist_ok=True)


def load_checkpoint(path: Path) -> Set[int]:
    if not path.exists():
        return set()
    data = json.loads(path.read_text(encoding="utf-8"))
    return set(data.get("processed_ids", []))


def save_checkpoint(path: Path, processed_ids: Set[int]) -> None:
    path.write_text(
        json.dumps({"processed_ids": sorted(processed_ids)}, indent=2),
        encoding="utf-8",
    )


def append_jsonl(path: Path, row: Dict) -> None:
    with path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(row, ensure_ascii=False) + "\n")


def write_csv(path: Path, rows: Iterable[Dict]) -> None:
    rows_list: List[Dict] = list(rows)
    if not rows_list:
        return
    fieldnames = sorted({k for r in rows_list for k in r.keys()})
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows_list)
