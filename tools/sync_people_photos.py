"""Synchronise official SNN-Unit portraits with the local People section.

Source: https://www.snnu.uni-saarland.de/?page_id=29

Dependencies are intentionally kept outside the application runtime:
    python -m pip install --target tools/.vendor requests beautifulsoup4
"""

from __future__ import annotations

import csv
import re
import sys
import unicodedata
from pathlib import Path
from urllib.parse import urljoin, urlparse


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools" / ".vendor"))

import requests  # noqa: E402
from bs4 import BeautifulSoup  # noqa: E402


URL = "https://www.snnu.uni-saarland.de/?page_id=29"
OUT_DIR = ROOT / "frontend" / "public" / "image" / "people"
MANIFEST = OUT_DIR / "people_photos.csv"
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; SNNU-website-sync/1.0)"}


def normalise(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = "".join(char for char in value if not unicodedata.combining(char))
    return re.sub(r"[^a-z0-9]+", " ", value.casefold()).strip()


def slugify(name: str) -> str:
    parts = normalise(name).split()
    ignored = {"prof", "dr", "rer", "nat", "med", "habil", "ing", "msc", "meng", "sc"}
    useful = [part for part in parts if part not in ignored]
    return "_".join(useful)


def image_extension(url: str, content_type: str) -> str:
    suffix = Path(urlparse(url).path).suffix.lower()
    if suffix in {".jpg", ".jpeg", ".png", ".webp"}:
        return ".jpg" if suffix == ".jpeg" else suffix
    return {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
    }.get(content_type.split(";", 1)[0].lower(), ".jpg")


def extract_people(html: str) -> list[dict[str, str]]:
    soup = BeautifulSoup(html, "html.parser")
    content = soup.find(id="main") or soup
    people: dict[str, dict[str, str]] = {}

    for image in content.find_all("img"):
        src = image.get("data-src") or image.get("src") or ""
        src_lower = src.casefold()
        if not src or any(skip in src_lower for skip in ("header", "grouppicture", "logo")):
            continue

        heading = image.find_next(["h6", "h5", "h4"])
        if not heading:
            continue
        name = heading.get_text(" ", strip=True)
        if not name or name.casefold() in {"group", "director", "deputy director", "lab heads", "alumni"}:
            continue

        info_block = heading.find_next("p")
        info = info_block.get_text("\n", strip=True) if info_block else ""
        email_match = re.search(r"[\w.+-]+@[\w.-]+", info)
        photo_url = urljoin(URL, src)

        key = normalise(name)
        people[key] = {
            "name": name,
            "email": email_match.group(0) if email_match else "",
            "photo_url": photo_url,
            "info": info,
        }

    return list(people.values())


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    response = requests.get(URL, headers=HEADERS, timeout=30)
    response.raise_for_status()
    people = extract_people(response.text)

    rows: list[dict[str, str]] = []
    for person in people:
        image_response = requests.get(person["photo_url"], headers=HEADERS, timeout=30)
        image_response.raise_for_status()
        content_type = image_response.headers.get("Content-Type", "")
        if not content_type.casefold().startswith("image/"):
            raise RuntimeError(f"Unexpected content type for {person['name']}: {content_type}")

        extension = image_extension(person["photo_url"], content_type)
        filename = f"{slugify(person['name'])}{extension}"
        (OUT_DIR / filename).write_bytes(image_response.content)
        rows.append({**person, "local_file": filename})
        print(f"OK  {person['name']:<55} -> {filename}")

    with MANIFEST.open("w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=["name", "email", "photo_url", "local_file", "info"],
        )
        writer.writeheader()
        writer.writerows(rows)

    print(f"\nDownloaded {len(rows)} official portraits to {OUT_DIR}")
    print(f"Manifest: {MANIFEST}")


if __name__ == "__main__":
    main()
