"""Small regression checks for provenance and conservative corpus integration."""

import unittest

from scripts.prepare_corpus import (
    CURATED_COLLECTION,
    CURATED_INPUT,
    CURATED_URL,
    INPUT,
    add_curated_reading,
    prepare,
    read_csv,
)


class CorpusPreparationTests(unittest.TestCase):
    def test_curated_reading_keeps_bibliographic_provenance(self):
        lis, _ = prepare(read_csv(INPUT))
        original_ids = {work["id"] for work in lis}
        new, shared = add_curated_reading(lis, read_csv(CURATED_INPUT))

        self.assertEqual(len(read_csv(CURATED_INPUT)), 30)
        self.assertEqual((new, shared), (26, 4))
        self.assertEqual(len(lis), 219)
        self.assertTrue(original_ids.issubset({work["id"] for work in lis}))
        self.assertEqual(len({work["id"] for work in lis}), len(lis))
        self.assertTrue(all(work["verificationStatus"] == "unverified" for work in lis))

        curated = [
            (work, source)
            for work in lis
            for source in work["sources"]
            if source["collection"] == CURATED_COLLECTION
        ]
        self.assertEqual(len(curated), 30)
        self.assertEqual({source["curatedPosition"] for _, source in curated}, set(range(1, 31)))
        self.assertTrue(all(source["landingPage"] == CURATED_URL for _, source in curated))
        self.assertTrue(all(work["source"] == work["sources"][0] for work in lis))

        overlap = [work for work in lis if len(work["sources"]) > 1]
        self.assertEqual(len(overlap), 4)
        self.assertTrue(any("Algorithms of Oppression" in work["title"] for work in overlap))

    def test_invalid_curated_link_is_rejected(self):
        lis, _ = prepare(read_csv(INPUT))
        with self.assertRaisesRegex(ValueError, "lacks a title or source URL"):
            add_curated_reading(lis, [{
                "TITLE": "Example", "AUTHOR": "Researcher", "YEAR": "",
                "LINK": "not-a-url", "NOTE": "",
            }])

    def test_duplicate_curated_title_is_rejected(self):
        lis, _ = prepare(read_csv(INPUT))
        source = {
            "TITLE": "Example: A Study", "AUTHOR": "Researcher", "YEAR": "",
            "LINK": "https://example.org/book", "NOTE": "",
        }
        with self.assertRaisesRegex(ValueError, "Repeated curated reading"):
            add_curated_reading(lis, [source, source])


if __name__ == "__main__":
    unittest.main()
