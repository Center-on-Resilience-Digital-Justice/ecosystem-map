"""Prepare source-grounded bibliography records for the discovery prototype."""

import csv
import hashlib
import json
from datetime import date
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
INPUT = ROOT / "data" / "raw" / "black_excellence_lis.csv"
OUTPUT = ROOT / "src" / "data" / "works.json"
COLLECTION = "Black Excellence in LIS / Internet Studies"
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

        works.append({
            "id": work_id,
            "title": title,
            "author": author,
            "year": year,
            "url": link,
            "description": note,
            "searchText": ". ".join(part for part in (title, note) if part),
            "source": {
                "collection": COLLECTION,
                "file": INPUT.name,
                "row": source_row,
            },
            "verificationStatus": "unverified",
            "issues": issues,
        })

    return works, skipped


def main():
    if not INPUT.exists():
        raise SystemExit(f"CSV not found: {INPUT}")

    with INPUT.open("r", encoding="utf-8-sig", newline="") as source:
        reader = csv.DictReader(source)
        if not reader.fieldnames:
            raise SystemExit("CSV has no column headings")
        reader.fieldnames = [name.strip().upper() for name in reader.fieldnames]
        missing = REQUIRED_COLUMNS - set(reader.fieldnames)
        if missing:
            raise SystemExit(f"Missing columns: {', '.join(sorted(missing))}")
        works, skipped = prepare(reader)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(works, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Prepared {len(works)} works; skipped {skipped} incomplete or duplicate rows")
    print(f"Records requiring additional metadata review: {sum(bool(work['issues']) for work in works)}")
    print(f"Saved {OUTPUT.relative_to(ROOT)}")
    print("Review source metadata before publishing or using these records in a pilot.")


if __name__ == "__main__":
    main()
