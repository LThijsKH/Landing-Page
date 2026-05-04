import os
import json
import subprocess
from fractions import Fraction
from datetime import datetime


IMAGE_FOLDER = "static/img/photos"
ORIGINALS_FOLDER = "static/img/photos/Originals"
JSON_FILE = "static/data/photos.json"

MAX_SIZE = 25 * 1024 * 1024  # 25MB


def optimize_images():

    for file in os.listdir(ORIGINALS_FOLDER):
        if not file.lower().endswith((".jpg", ".jpeg", ".png")):
            continue

        input_path = os.path.join(ORIGINALS_FOLDER, file)
        name, _ = os.path.splitext(file)
        output_file = name + ".jpg"
        output_path = os.path.join(IMAGE_FOLDER, output_file)

        # Skip if already processed
        if os.path.exists(output_path):
            continue

        try:
            subprocess.run([
                "magick",
                input_path,
                "-resize", "4000x4000>",
                "-strip",
                "-quality", "95",
                output_path
            ], check=True)

            size = os.path.getsize(output_path)

            if size > MAX_SIZE:
                print(f"⚠ {output_file} → {size // (1024*1024)} MB (too large)")

        except Exception as e:
            print(f"Error processing {file}: {e}")


def format_shutter(val):
    try:
        val = float(val)

        if val >= 1:
            return f"{val:.1f}".rstrip("0").rstrip(".") + "s"
        else:
            frac = Fraction(val).limit_denominator(8000)
            return f"{frac.numerator}/{frac.denominator}s"
    except:
        return None


def format_date(date_str):
    try:
        dt = datetime.strptime(date_str, "%Y:%m:%d %H:%M:%S")
        return dt.strftime("%B %Y")
    except:
        return ""


def get_exif_data(image_path):
    try:
        result = subprocess.run(
            ["exiftool", "-json", "-n", image_path],
            capture_output=True,
            text=True
        )

        if not result.stdout.strip():
            return {}

        data = json.loads(result.stdout)[0]
        out = {}

        # Camera
        out["camera"] = data.get("CameraModelName") or data.get("Model")

        # Lens
        out["lens"] = data.get("Lens") or data.get("LensID")

        # ISO
        if "ISO" in data:
            try:
                out["iso"] = int(data["ISO"])
            except:
                out["iso"] = data["ISO"]

        # Focal
        if "FocalLengthIn35mmFormat" in data:
            out["focal"] = f"{data['FocalLengthIn35mmFormat']}mm"
        elif "FocalLength" in data:
            val = str(data["FocalLength"])
            if "mm" in val:
                out["focal"] = val.replace(" ", "")
            else:
                out["focal"] = f"{val}mm"

        # Aperture
        if "FNumber" in data:
            try:
                out["aperture"] = f"f{float(data['FNumber']):.1f}".rstrip("0").rstrip(".")
            except:
                out["aperture"] = f"f{data['FNumber']}"

        # Shutter
        if "ExposureTime" in data:
            formatted = format_shutter(data["ExposureTime"])
            if formatted:
                out["shutter"] = formatted

        # GPS
        if "GPSLatitude" in data and "GPSLongitude" in data:
            try:
                lat = float(data["GPSLatitude"])
                lon = float(data["GPSLongitude"])
                out["coords"] = f"{lat:.4f},{lon:.4f}"
            except:
                pass

        # Date
        out["date"] = data.get("DateTimeOriginal") or data.get("CreateDate")
        out["date_formatted"] = format_date(out["date"])

        return out

    except Exception as e:
        print(f"EXIF error for {image_path}: {e}")
        return {}


def load_existing():
    if not os.path.exists(JSON_FILE):
        return []

    try:
        with open(JSON_FILE, "r") as f:
            content = f.read().strip()
            if not content:
                return []
            return json.loads(content)
    except json.JSONDecodeError:
        print("Warning: Invalid JSON. Resetting file.")
        return []


def save(data):
    with open(JSON_FILE, "w") as f:
        json.dump(data, f, indent=2)


def main():
    # Step 1: Optimize images from Originals → main folder
    optimize_images()

    # Step 2: Load existing JSON
    existing = load_existing()
    existing_map = {item["path"]: item for item in existing}

    results = []

    for file in os.listdir(IMAGE_FOLDER):
        if not file.lower().endswith((".jpg", ".jpeg", ".png")):
            continue

        full_path = os.path.join(IMAGE_FOLDER, file)
        public_path = f"img/photos/{file}"

        exif_data = get_exif_data(full_path)

        if public_path in existing_map:
            entry = existing_map[public_path]

            AUTO_FIELDS = ["camera", "lens", "iso", "focal", "aperture", "shutter", "coords"]

            for key, value in exif_data.items():
                if value is None:
                    continue

                if key in AUTO_FIELDS:
                    entry[key] = value
                else:
                    if key not in entry or entry[key] in [None, "", 0]:
                        entry[key] = value
        else:
            entry = {
                "path": public_path,
                "alt": "",
                "location": "",
                **exif_data
            }

        results.append(entry)

    save(results)


if __name__ == "__main__":
    main()