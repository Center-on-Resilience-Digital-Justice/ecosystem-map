"""Prepare source-grounded bibliography records for the discovery prototype."""

import csv
import hashlib
import json
import re
from datetime import date
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
INPUT = ROOT / "data" / "raw" / "black_excellence_lis.csv"
CURATED_INPUT = ROOT / "data" / "raw" / "crdj_essential_reading.csv"
OUTPUT = ROOT / "src" / "data" / "works.json"
COLLECTION = "Black Excellence in LIS / Internet Studies"
CURATED_COLLECTION = "CRDJ Essential Reading"
CURATED_URL = "https://www.raceanddigitaljustice.org/essentialreading"
REQUIRED_COLUMNS = {"TITLE", "AUTHOR", "YEAR", "LINK", "NOTE"}


def clean(value):
    return " ".join((value or "").split())


def publication_year(value):
    try:
        number = float(clean(value))
        if number.is_integer() and 1800 <= number <= date.today().year:
            return int(number)
    except ValueError:
        pass
    return None


def has_web_link(value):
    parsed = urlparse(value)
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def read_csv(path):
    if not path.exists():
        raise SystemExit(f"CSV not found: {path}")
    with path.open("r", encoding="utf-8-sig", newline="") as source:
        reader = csv.DictReader(source)
        if not reader.fieldnames:
            raise SystemExit(f"CSV has no column headings: {path}")
        reader.fieldnames = [name.strip().upper() for name in reader.fieldnames]
        missing = REQUIRED_COLUMNS - set(reader.fieldnames)
        if missing:
            raise SystemExit(f"Missing columns in {path.name}: {', '.join(sorted(missing))}")
        return list(reader)


def matching_title(value):
    """A conservative title key; subtitle variations require a matching author."""
    return " ".join(re.findall(r"\w+", clean(value).split(":", 1)[0].casefold()))


def author_surname(value):
    lead = clean(value).split(";", 1)[0]
    words = re.findall(r"\w+", lead.casefold())
    if words and words[-1] in {"jr", "sr", "ii", "iii"}:
        words.pop()
    return words[-1] if words else ""


def shared_work(existing, title, author):
    surname = author_surname(author)
    if not surname or matching_title(existing["title"]) != matching_title(title):
        return False
    return surname in re.findall(r"\w+", existing["author"].casefold())


def prepare(rows):
    works = []
    seen = set()
    skipped = 0

    for source_row, row in enumerate(rows, start=2):
        title = clean(row.get("TITLE"))
        author = clean(row.get("AUTHOR"))
        link = clean(row.get("LINK"))
        note = clean(row.get("NOTE"))
        year = publication_year(row.get("YEAR"))

        if not any((title, author, link, note, clean(row.get("YEAR")))):
            continue
        if not title or not has_web_link(link):
            skipped += 1
            continue

        # Keep original author text: commas can mean coauthors or name order.
        identity = f"{title.casefold()}|{author.casefold()}"
        work_id = "lis-" + hashlib.sha1(identity.encode("utf-8")).hexdigest()[:12]
        if work_id in seen:
            skipped += 1
            continue
        seen.add(work_id)

        issues = []
        if not author:
            issues.append("missing_author")
        if year is None:
            issues.append("missing_or_invalid_year")

        source = {
            "collection": COLLECTION,
            "file": INPUT.name,
            "row": source_row,
        }
        works.append({
            "id": work_id,
            "title": title,
            "author": author,
            "year": year,
            "url": link,
            "description": note,
            "searchText": ". ".join(part for part in (title, note) if part),
            "source": source,
            "sources": [source],
            "verificationStatus": "unverified",
            "issues": issues,
        })

    return works, skipped


def add_curated_reading(works, rows):
    """Keep collection membership explicit and preserve LIS work IDs on overlap."""
    seen_titles = set()
    added = 0
    overlaps = 0
    for row_number, row in enumerate(rows, start=2):
        title = clean(row.get("TITLE"))
        author = clean(row.get("AUTHOR"))
        url = clean(row.get("LINK"))
        note = clean(row.get("NOTE"))
        year = publication_year(row.get("YEAR"))
        if not title or not has_web_link(url):
            raise ValueError(f"Curated reading entry {row_number} lacks a title or source URL")
        normalized = matching_title(title)
        if normalized in seen_titles:
            raise ValueError(f"Repeated curated reading title on row {row_number}: {title}")
        seen_titles.add(normalized)

        source = {
            "collection": CURATED_COLLECTION,
            "file": CURATED_INPUT.name,
            "row": row_number,
            "landingPage": CURATED_URL,
            "curatedPosition": row_number - 1,
        }

        existing = next((work for work in works if shared_work(work, title, author)), None)
        if existing:
            existing["sources"].append(source)
            overlaps += 1
            continue

        identity = f"{title.casefold()}|{author.casefold()}"
        work_id = "crdj-" + hashlib.sha1(identity.encode("utf-8")).hexdigest()[:12]
        issues = ["source_metadata_needs_review"]
        if not author:
            issues.append("missing_author")
        if year is None:
            issues.append("missing_or_invalid_year")
        works.append({
            "id": work_id,
            "title": title,
            "author": author,
            "year": year,
            "url": url,
            "description": note,
            "searchText": title,
            "source": source,
            "sources": [source],
            "verificationStatus": "unverified",
            "issues": issues,
        })
        added += 1
    return added, overlaps


def main():
    works, skipped = prepare(read_csv(INPUT))
    added, overlaps = add_curated_reading(works, read_csv(CURATED_INPUT))

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(works, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Prepared {len(works)} works; skipped {skipped} incomplete or duplicate rows")
    print(f"CRDJ reading list: {added} new records and {overlaps} shared with LIS bibliography")
    print(f"Records requiring additional metadata review: {sum(bool(work['issues']) for work in works)}")
    print(f"Saved {OUTPUT.relative_to(ROOT)}")
    print("Review source metadata before publishing or using these records in a pilot.")


if __name__ == "__main__":
    main()
