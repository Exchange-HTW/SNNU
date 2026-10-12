"""Audit papers.csv against OpenAlex/Crossref and build the publication catalogue.

Only PDFs whose location has an explicit reusable Creative Commons licence are
downloaded.  A URL being publicly reachable is deliberately not sufficient.
"""

from __future__ import annotations

import ast
import csv
import hashlib
import html
import json
import os
import re
import shutil
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from difflib import SequenceMatcher
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INPUT = ROOT / "papers.csv"
MANIFEST = ROOT / "manifest.csv"
PUBLICATION_DIR = ROOT / "frontend" / "public" / "publication"
SECTION_FILE = ROOT / "backend" / "base_data" / "sections" / "publication.py"
CACHE_FILE = ROOT / ".publication_audit_cache.json"
USER_AGENT = "SNNU-publication-audit/1.0 (https://www.snnu.org)"
OPENALEX_API_KEY = os.getenv("OPENALEX_API_KEY", "").strip()

# ND licences permit redistribution but not adaptation.  We exclude them here
# because the requested criterion is reusable, not merely redistributable.
REUSABLE_LICENSES = {
    "cc0", "public-domain", "cc-by", "cc-by-sa", "cc-by-nc", "cc-by-nc-sa"
}

# Older conference abstracts that have no DOI in papers.csv and are not
# indexed by Crossref. Their year is documented by the lab publication list.
YEAR_OVERRIDES = {
    normalize_title: "1998"
    for normalize_title in (
        "a new method for the discrimination of antegrade and retrograde atrial activation",
        "analysis of bipolar endocardial signals for discrimination of antegrade and retrograde atrial actication",
        "discrimination of antegrade and retrograde atrial activation by using wavelet transforms",
        "discrimination of atrial fibrillation and atrial flutter using the discrete wavelet transform",
        "endocardial signal processing using discrete wavelet transforms",
        "feasibility of wavelet transforms for discrimination of antegrade form retrograde atrial activation",
    )
}


def request_json(url: str, attempts: int = 3) -> dict:
    for attempt in range(attempts):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=12) as response:
                return json.load(response)
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            if attempt == attempts - 1:
                raise
            is_rate_limit = isinstance(exc, urllib.error.HTTPError) and exc.code == 429
            time.sleep((2 if is_rate_limit else 1) * (attempt + 1))
    raise RuntimeError("unreachable")


def normalize(value: str) -> str:
    value = unicodedata.normalize("NFKD", value or "")
    value = "".join(c for c in value if not unicodedata.combining(c))
    value = re.sub(r"\((accepted|in press)\)", "", value, flags=re.I)
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def similarity(left: str, right: str) -> float:
    return SequenceMatcher(None, normalize(left), normalize(right)).ratio()


def clean_doi(doi: str | None) -> str:
    doi = (doi or "").strip()
    doi = re.sub(r"^https?://(?:dx\.)?doi\.org/", "", doi, flags=re.I)
    return doi.lower()


def slug(value: str, limit: int = 58) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = "".join(c for c in value if not unicodedata.combining(c))
    value = re.sub(r"[^A-Za-z0-9]+", "-", value).strip("-").lower()
    return value[:limit].rstrip("-") or "publication"


def load_existing_cards() -> list[dict]:
    tree = ast.parse(SECTION_FILE.read_text(encoding="utf-8"))
    for node in tree.body:
        if isinstance(node, ast.Assign) and any(
            isinstance(t, ast.Name) and t.id == "PUBLICATION_SECTION" for t in node.targets
        ):
            return ast.literal_eval(node.value)["cards"]
    return []


def fallback_authors(card: dict) -> str:
    text = re.sub(r"<[^>]+>", "", card.get("text", ""))
    for marker in ("â€œ", "“", "&ldquo;"):
        if marker in text:
            return html.unescape(text.split(marker, 1)[0]).strip(" ,")
    return ""


def openalex_by_doi(doi: str) -> dict | None:
    encoded = urllib.parse.quote("https://doi.org/" + doi, safe="")
    fields = "id,doi,title,publication_year,authorships,open_access,best_oa_location,locations,primary_location"
    try:
        return request_json(f"https://api.openalex.org/works/{encoded}?select={fields}&api_key={urllib.parse.quote(OPENALEX_API_KEY)}")
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            return None
        raise


def openalex_search(title: str) -> dict | None:
    params = urllib.parse.urlencode({
        "search": title,
        "per-page": 5,
        "select": "id,doi,title,publication_year,authorships,open_access,best_oa_location,locations,primary_location",
        "api_key": OPENALEX_API_KEY,
    })
    results = request_json("https://api.openalex.org/works?" + params, attempts=2).get("results", [])
    if not results:
        return None
    best = max(results, key=lambda item: similarity(title, item.get("title", "")))
    return best if similarity(title, best.get("title", "")) >= 0.82 else None


def prefetch_openalex_dois(papers: list[dict], cache: dict) -> None:
    """Resolve DOI records in small OR-filter batches to minimise API traffic."""
    missing = []
    for paper in papers:
        doi = clean_doi(paper.get("doi"))
        if doi and doi not in cache:
            missing.append(doi)
    fields = "id,doi,title,publication_year,authorships,open_access,best_oa_location,locations,primary_location"
    for offset in range(0, len(missing), 20):
        batch = missing[offset:offset + 20]
        params = urllib.parse.urlencode({
            "filter": "doi:" + "|".join(batch),
            "per-page": 100,
            "select": fields,
        })
        try:
            results = request_json("https://api.openalex.org/works?" + params).get("results", [])
        except Exception as exc:
            print(f"DOI batch {offset // 20 + 1} failed: {exc}", flush=True)
            continue
        for work in results:
            doi = clean_doi(work.get("doi"))
            if doi:
                cache[doi] = work
        print(f"DOI batch {offset // 20 + 1}: {len(results)} works", flush=True)
        time.sleep(1)


def crossref_metadata(doi: str) -> dict | None:
    try:
        encoded = urllib.parse.quote(doi, safe="")
        return request_json(f"https://api.crossref.org/works/{encoded}").get("message")
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            return None
        raise


def crossref_search(title: str) -> dict | None:
    params = urllib.parse.urlencode({"query.title": title, "rows": 5})
    try:
        items = request_json("https://api.crossref.org/works?" + params).get("message", {}).get("items", [])
    except Exception:
        return None
    if not items:
        return None
    best = max(items, key=lambda item: similarity(title, (item.get("title") or [""])[0]))
    return best if similarity(title, (best.get("title") or [""])[0]) >= 0.90 else None


def crossref_licence(work: dict) -> str:
    for entry in work.get("license", []):
        url = (entry.get("URL") or "").lower().rstrip("/")
        if "creativecommons.org/publicdomain/zero" in url:
            return "cc0"
        match = re.search(r"creativecommons\.org/licenses/(by(?:-nc)?(?:-sa)?)/", url)
        if match:
            return "cc-" + match.group(1)
    return ""


def crossref_pdf_locations(work: dict) -> list[dict]:
    licence = crossref_licence(work)
    if licence not in REUSABLE_LICENSES:
        return []
    source = (work.get("container-title") or [""])[0] or work.get("publisher") or "Publisher"
    locations = []
    for link in work.get("link", []):
        content_type = (link.get("content-type") or "").lower()
        url = link.get("URL") or ""
        if "pdf" not in content_type and not url.lower().split("?", 1)[0].endswith(".pdf"):
            continue
        locations.append({
            "pdf_url": url,
            "landing_page_url": "https://doi.org/" + clean_doi(work.get("DOI")),
            "license": licence,
            "version": "publishedVersion",
            "source": {"display_name": source, "type": "journal"},
        })
    return locations


def authors_from_openalex(work: dict) -> str:
    names = [
        entry.get("author", {}).get("display_name", "").strip()
        for entry in work.get("authorships", [])
    ]
    return "; ".join(name for name in names if name)


def authors_from_crossref(work: dict) -> str:
    names = []
    for author in work.get("author", []):
        name = " ".join(filter(None, [author.get("given"), author.get("family")])).strip()
        if name:
            names.append(name)
    return "; ".join(names)


def source_name(location: dict) -> str:
    source = location.get("source") or {}
    return source.get("display_name") or source.get("host_organization_name") or "Open-access source"


def ranked_pdf_locations(work: dict) -> list[dict]:
    candidates = []
    seen = set()
    for location in [work.get("best_oa_location"), *(work.get("locations") or [])]:
        if not location or not location.get("pdf_url"):
            continue
        licence = (location.get("license") or "").lower()
        if licence not in REUSABLE_LICENSES:
            continue
        url = location["pdf_url"]
        if url in seen:
            continue
        seen.add(url)
        name = source_name(location).lower()
        priority = 5
        if "pubmed central" in name or "europe pmc" in name:
            priority = 0
        elif any(term in name for term in ("arxiv", "biorxiv", "medrxiv")):
            priority = 1
        elif (location.get("source") or {}).get("type") == "repository":
            priority = 2
        elif location.get("version") == "publishedVersion":
            priority = 3
        candidates.append((priority, location))
    return [location for _, location in sorted(candidates, key=lambda pair: pair[0])]


def download_pdf(url: str, destination: Path) -> bool:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/pdf"})
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            started = time.monotonic()
            chunks = []
            size = 0
            while True:
                chunk = response.read(128 * 1024)
                if not chunk:
                    break
                chunks.append(chunk)
                size += len(chunk)
                if size > 80 * 1024 * 1024 or time.monotonic() - started > 10:
                    return False
            data = b"".join(chunks)
    except (urllib.error.URLError, TimeoutError):
        return False
    if len(data) > 80 * 1024 * 1024 or not data.lstrip().startswith(b"%PDF"):
        return False
    try:
        destination.write_bytes(data)
    except OSError:
        return False
    return True


def year_from_crossref(work: dict) -> str:
    for key in ("published-print", "published-online", "published", "issued"):
        parts = (work.get(key) or {}).get("date-parts") or []
        if parts and parts[0] and parts[0][0] is not None:
            return str(parts[0][0])

    event = work.get("event") or {}
    event_text = " ".join(filter(None, [event.get("name"), event.get("acronym")]))
    full_year = re.search(r"\b(?:19|20)\d{2}\b", event_text)
    if full_year:
        return full_year.group(0)
    short_year = re.search(r"(?:[-'’])(\d{2})\b", event_text)
    if short_year:
        value = int(short_year.group(1))
        return str(1900 + value if value >= 70 else 2000 + value)

    created = (work.get("created") or {}).get("date-parts") or []
    if created and created[0] and created[0][0] is not None:
        return str(created[0][0])
    return ""


def make_filename(year: str, authors: str, title: str, doi: str) -> str:
    first = authors.split(";", 1)[0].split()[-1] if authors else "unknown"
    fingerprint = hashlib.sha1((doi or title).encode("utf-8")).hexdigest()[:8]
    return f"{year or 'undated'}_{slug(first, 20)}_{slug(title)}_{fingerprint}.pdf"


def build_card(row: dict) -> dict:
    title = html.escape(row["title"])
    authors = html.escape(row["authors"] or "Authors not identified")
    year = html.escape(row["year"] or "Year not identified")
    details = f"{authors}. “{title}.” {year}."
    if row["doi"]:
        doi_url = "https://doi.org/" + urllib.parse.quote(row["doi"], safe="/()")
        details += f" doi: <a href='{html.escape(doi_url)}' target='_blank' rel='noopener noreferrer'>{html.escape(row['doi'])}</a>"
    elif row["landing_page_url"]:
        details += f" <a href='{html.escape(row['landing_page_url'])}' target='_blank' rel='noopener noreferrer'>Official record</a>"
    if row["local_name"]:
        details += (
            " <a href='/publication/" + urllib.parse.quote(row["local_name"]) + "' target='_blank' "
            "rel='noopener noreferrer' class='publication-pdf-link'>Download PDF (" +
            html.escape(row["license"].upper()) + ")</a>"
        )
    return {
        "year": row["year"] or "Unknown",
        "subtitle": row["year"] or "Unknown",
        "title": row["title"],
        "authors": [name.strip() for name in row["authors"].split(";") if name.strip()],
        "text": details,
        "icon": "fa-file-lines",
        "align": "left",
        "fullWidth": True,
    }


def main() -> None:
    PUBLICATION_DIR.mkdir(parents=True, exist_ok=True)
    papers = list(csv.DictReader(INPUT.open(encoding="utf-8-sig", newline="")))
    existing_cards = load_existing_cards()
    loaded_cache = json.loads(CACHE_FILE.read_text(encoding="utf-8")) if CACHE_FILE.exists() and CACHE_FILE.stat().st_size else {}
    # False entries can also represent a transient rate-limit failure from an
    # interrupted run, so only retain successful API responses.
    cache = {key: value for key, value in loaded_cache.items() if value}
    if OPENALEX_API_KEY:
        prefetch_openalex_dois(papers, cache)
    else:
        print("OPENALEX_API_KEY not set; using Crossref licence/PDF metadata.", flush=True)
    output = []

    for index, paper in enumerate(papers):
        original_title = (paper.get("title") or "").strip()
        print(f"[{index + 1}/{len(papers)}] checking: " + original_title[:60].encode("ascii", "replace").decode("ascii"), flush=True)
        input_doi = clean_doi(paper.get("doi"))
        key = input_doi or "title:" + normalize(original_title)
        work = cache.get(key)
        if work is None and OPENALEX_API_KEY:
            try:
                work = openalex_by_doi(input_doi) if input_doi else openalex_search(original_title)
            except Exception as exc:
                print(f"[{index + 1}/{len(papers)}] OpenAlex error: {exc}")
                work = None
            if work:
                cache[key] = work
            time.sleep(0.35)

        resolved_doi = clean_doi((work or {}).get("doi")) or input_doi
        crossref = crossref_metadata(resolved_doi) if resolved_doi and not work else None
        if not resolved_doi and not work:
            crossref = crossref_search(original_title)
            resolved_doi = clean_doi((crossref or {}).get("DOI"))
        title = (work or {}).get("title") or ((crossref or {}).get("title") or [original_title])[0]
        authors = authors_from_openalex(work) if work else authors_from_crossref(crossref or {})
        if not authors and index < len(existing_cards):
            authors = fallback_authors(existing_cards[index])
        year = str((work or {}).get("publication_year") or year_from_crossref(crossref or {}) or
                   (existing_cards[index].get("year") if index < len(existing_cards) else ""))
        year = YEAR_OVERRIDES.get(normalize(title), year)

        selected = None
        local_name = ""
        # A work can contain many duplicate or stale harvest locations. Three
        # independently licensed candidates provide useful fallback without
        # letting a single record stall the full catalogue audit.
        locations = ranked_pdf_locations(work or {})[:2] or crossref_pdf_locations(crossref or {})[:2]
        for location in locations:
            if shutil.disk_usage(ROOT).free < 2 * 1024 * 1024:
                break
            candidate_name = make_filename(year, authors, title, resolved_doi)
            destination = PUBLICATION_DIR / candidate_name
            if destination.exists() or download_pdf(location["pdf_url"], destination):
                selected = location
                local_name = candidate_name
                break

        primary = (work or {}).get("primary_location") or {}
        if not primary and crossref:
            primary = {
                "landing_page_url": "https://doi.org/" + resolved_doi if resolved_doi else "",
                "source": {"display_name": (crossref.get("container-title") or [""])[0] or crossref.get("publisher", "")},
            }
        landing = (selected or {}).get("landing_page_url") or primary.get("landing_page_url")
        if not landing and resolved_doi:
            landing = "https://doi.org/" + resolved_doi
        row = {
            "title": title,
            "authors": authors,
            "year": year,
            "doi": resolved_doi,
            "license": (selected or {}).get("license", ""),
            "source": source_name(selected) if selected else source_name(primary) if primary else "",
            "local_name": local_name,
            "landing_page_url": landing or "",
            "pdf_url": (selected or {}).get("pdf_url", ""),
            "open_access": "yes" if selected else "no_verified_reusable_pdf",
        }
        output.append(row)
        message = f"[{index + 1}/{len(papers)}] {'PDF' if local_name else 'record'}: {title[:72]}"
        print(message.encode("ascii", "replace").decode("ascii"), flush=True)

    output.sort(key=lambda row: (
        -(int(row["year"]) if str(row["year"]).isdigit() else -1),
        normalize(row["title"]),
    ))

    fields = ["title", "authors", "year", "doi", "license", "source", "local_name",
              "landing_page_url", "pdf_url", "open_access"]
    with MANIFEST.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(output)

    cards = [build_card(row) for row in output]
    section = {"id": "section-publication", "title": "Publication", "icon": "fa-book", "cards": cards}
    SECTION_FILE.write_text(
        "# Generated by tools/audit_publications.py; edit papers.csv, then rerun the audit.\n"
        "PUBLICATION_SECTION = " + repr(section) + "\n",
        encoding="utf-8",
    )
    print(f"Completed: {len(output)} records, {sum(bool(row['local_name']) for row in output)} reusable PDFs")


if __name__ == "__main__":
    main()
