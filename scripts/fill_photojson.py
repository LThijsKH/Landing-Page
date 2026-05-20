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

    print("Optimizing images...")
    print("--------------------")

    sizes = {
        "thumb": 600,
        "medium": 1200,
        "full": 3200,
    }

    qualities = {
        "thumb": "78",
        "medium": "82",
        "full": "90",
    }

    for file in os.listdir(ORIGINALS_FOLDER):

        if not file.lower().endswith(
            (".jpg", ".jpeg", ".png")
        ):
            continue

        input_path = os.path.join(
            ORIGINALS_FOLDER,
            file
        )

        name, _ = os.path.splitext(file)

        for label, width in sizes.items():

            output_file = (
                f"{name}-{label}.webp"
            )

            output_path = os.path.join(
                IMAGE_FOLDER,
                output_file
            )

            try:

                subprocess.run([
                    "magick",
                    input_path,
                    "-auto-orient",
                    "-resize",
                    f"{width}x{width}>",
                    "-strip",
                    "-quality",
                    qualities[label],
                    output_path
                ], check=True)

                size = os.path.getsize(
                    output_path
                )

                print(
                    f"✓ {output_file} "
                    f"→ {size // 1024} KB"
                )

            except Exception as e:

                print(
                    f"Error processing "
                    f"{file}: {e}"
                )


def format_shutter(val):
    try:
        val = float(val)

        if val >= 1:
            return f"{val:.1f}".rstrip("0").rstrip(".") + "s"

        frac = Fraction(val).limit_denominator(8000)

        return f"{frac.numerator}/{frac.denominator}s"

    except:
        return None


def format_date(date_str):
    try:
        dt = datetime.strptime(
            date_str,
            "%Y:%m:%d %H:%M:%S"
        )

        return dt.strftime("%B %Y")

    except:
        return ""


def get_image_dimensions(data):

    width = (
        data.get("ImageWidth")
        or data.get("SourceImageWidth")
    )

    height = (
        data.get("ImageHeight")
        or data.get("SourceImageHeight")
    )

    if not width or not height:
        return {}

    try:

        width = int(width)
        height = int(height)

        return {
            "width": width,
            "height": height,
            "aspect_ratio": round(width / height, 4),
            "orientation": (
                "vertical"
                if height > width
                else "horizontal"
            )
        }

    except:
        return {}

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

        out["camera"] = (
            data.get("CameraModelName")
            or data.get("Model")
        )

        out["lens"] = (
            data.get("Lens")
            or data.get("LensID")
        )

        if "ISO" in data:
            try:
                out["iso"] = int(data["ISO"])
            except:
                out["iso"] = data["ISO"]

        if "FocalLengthIn35mmFormat" in data:

            out["focal"] = (
                f"{data['FocalLengthIn35mmFormat']}mm"
            )

        elif "FocalLength" in data:

            val = str(data["FocalLength"])

            out["focal"] = (
                val.replace(" ", "")
                if "mm" in val
                else f"{val}mm"
            )

        if "FNumber" in data:

            try:
                out["aperture"] = (
                    f"f{float(data['FNumber']):.1f}"
                    .rstrip("0")
                    .rstrip(".")
                )

            except:
                out["aperture"] = f"f{data['FNumber']}"

        if "ExposureTime" in data:

            formatted = format_shutter(
                data["ExposureTime"]
            )

            if formatted:
                out["shutter"] = formatted

        if (
            "GPSLatitude" in data
            and "GPSLongitude" in data
        ):

            try:
                lat = float(data["GPSLatitude"])
                lon = float(data["GPSLongitude"])

                out["coords"] = f"{lat:.4f},{lon:.4f}"

            except:
                pass

        out["date"] = (
            data.get("DateTimeOriginal")
            or data.get("CreateDate")
        )

        out["date_formatted"] = format_date(
            out["date"]
        )

        out.update(
            get_image_dimensions(data)
        )

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

            data = (
                json.loads(content)
                if content
                else []
            )

            return sorted(
                data,
                key=lambda img: datetime.strptime(
                    img["date"],
                    "%Y:%m:%d %H:%M:%S"
                ) if img.get("date") else datetime.min,
                reverse=True
            )

    except:
        print("Warning: Invalid JSON. Resetting file.")
        return []


def save(data):

    data = sorted(
        data,
        key=lambda img: datetime.strptime(
            img["date"],
            "%Y:%m:%d %H:%M:%S"
        ) if img.get("date") else datetime.min,
        reverse=True
    )

    with open(JSON_FILE, "w") as f:
        json.dump(data, f, indent=2)


def log_change(path, key, old, new):
    print(
        f"UPDATE [{path}] "
        f"{key}: '{old}' → '{new}'"
    )


def main():

    optimize_images()

    existing = load_existing()

    existing_map = {
        item.get("slug"): item
        for item in existing
    }

    results = []

    protected_fields = {
        "path",
        "location",
        "alt"
    }

    for file in os.listdir(ORIGINALS_FOLDER):

        if not file.lower().endswith(
            (".jpg", ".jpeg", ".png")
        ):
            continue

        name, _ = os.path.splitext(file)

        public_path = f"img/photos/{name}"

        original_path = os.path.join(
            ORIGINALS_FOLDER,
            file
        )

        exif_data = get_exif_data(original_path)

        if name in existing_map:
            entry = existing_map[name]

            entry["slug"] = name

            entry["path"] = public_path

            entry["images"] = {
                "thumb": f"img/photos/{name}-thumb.webp",
                "medium": f"img/photos/{name}-medium.webp",
                "full": f"img/photos/{name}-full.webp",
            }

            for key, value in exif_data.items():

                if value is None:
                    continue

                # NEVER overwrite manual fields
                if key in protected_fields:
                    continue

                if key in entry:

                    if entry[key] != value:

                        log_change(
                            public_path,
                            key,
                            entry[key],
                            value
                        )

                        entry[key] = value

                else:

                    print(
                        f"NEW FIELD "
                        f"[{public_path}] "
                        f"{key}: '{value}'"
                    )

                    entry[key] = value

        else:

            print(f"NEW IMAGE: {public_path}")

            entry = {
                "slug": name,
                "path": public_path,

                "images": {
                    "thumb": f"img/photos/{name}-thumb.webp",
                    "medium": f"img/photos/{name}-medium.webp",
                    "full": f"img/photos/{name}-full.webp",
                },

                "alt": "",
                "location": "",

                **exif_data
            }

        results.append(entry)

    # Preserve removed originals
    existing_paths = {
        item["path"]
        for item in results
    }

    for item in existing:

        if item["path"] not in existing_paths:

            print(
                f"PRESERVED "
                f"(missing original): "
                f"{item['path']}"
            )

            results.append(item)

    save(results)


if __name__ == "__main__":
    main()