from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
PHOTOS_DIR = ROOT / "img" / "photos"
DATA_DIR = ROOT / "data"
DATA_FILE = DATA_DIR / "photos.json"

ALLOWED = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def list_photo_paths():
    if not PHOTOS_DIR.exists():
        print(f"Error: photos dir not found: {PHOTOS_DIR}")
        sys.exit(1)
    files = [p for p in sorted(PHOTOS_DIR.iterdir()) if p.suffix.lower() in ALLOWED and p.is_file()]
    # use paths relative to static/ so templates can use url_for('static', filename=path)
    return [str(Path("img") / "photos" / p.name) for p in files]


def load_existing():
    if not DATA_FILE.exists():
        return {}
    try:
        data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
        return {entry.get("path"): entry.get("description", "") for entry in data if isinstance(entry, dict) and entry.get("path")}
    except Exception as e:
        print(f"Warning: failed to load existing {DATA_FILE}: {e}")
        return {}


def write_data(photo_paths, existing_map):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    out = []
    for path in photo_paths:
        out.append({"path": path, "description": existing_map.get(path, "")})
    DATA_FILE.write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")
    return out


if __name__ == "__main__":
    photo_paths = list_photo_paths()
    existing = load_existing()
    new_data = write_data(photo_paths, existing)

    added = [p for p in photo_paths if p not in existing]
    removed = [p for p in existing if p not in photo_paths]

    print(f"Wrote {len(new_data)} entries to {DATA_FILE}")
    if added:
        print(f"Added {len(added)} new image(s):")
        for p in added:
            print("  ", p)
    if removed:
        print(f"Removed {len(removed)} missing image(s):")
        for p in removed:
            print("  ", p)
    if not added and not removed:
        print("No changes detected.")
