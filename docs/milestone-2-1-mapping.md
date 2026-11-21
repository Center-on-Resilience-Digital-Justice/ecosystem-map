# Milestone 2.1 — Source-grounded intellectual community mapping

## Research intent

The CRDJ Lab's participatory intellectual discovery prototype begins with the question: **How might researchers encounter, explore, question, and contribute to intellectual communities in ways that deepen inquiry and challenge established knowledge hierarchies?**

Our initial field of inquiry is Black scholarship in Critical Internet and Information Studies, with a longer-term research direction toward intellectual genealogies in Critical Race and Digital Studies. Dorothy Porter Wesley's bibliographic organization of Black knowledge and Safiya Umoja Noble's argument for expert-stewarded public-interest search inform our treatment of sources, context, and discovery. Sasha Costanza-Chock's design justice framework informs the commitment to researcher agency and accountable representation.

The visual network currently represents *retrieval, editorial curation, and provisional contributor credits*. Those relations are a basis for inquiry, **not** verified mentorship, citation networks, or intellectual influence.

## Data sources and preparation

1. `data/raw/black_excellence_lis.csv`: the original Black Excellence in LIS / Internet Studies bibliography (193 distinct prepared works at the start of this milestone).
2. `data/raw/crdj_essential_reading.csv`: a manually transcribed snapshot of the [CRDJ Essential Reading list](https://www.raceanddigitaljustice.org/essentialreading) with 30 linked books, in the displayed order. The seed includes bibliographic title, contributor credits where available, and original outgoing links. The books' dates are intentionally left blank pending verification; edited-volume and other roles also need review.

Run:

```bash
python3 scripts/prepare_corpus.py
npm run embeddings:build
python3 -m unittest discover -s tests -v
npm run lint
npm run build
```

The prepared corpus currently contains **219 distinct works**: 193 original works, 26 new records, and **four shared titles** (Algorithms of Oppression, Black Software, Distributed Blackness, Race After Technology). Overlaps retain the original LIS IDs and acquire a second source attribution. Every CRDJ entry retains its original position (1–30) and a link to the curator's page. The `sources` array holds all visible collection memberships; `source` remains the backward-compatible primary record. All metadata remains `unverified` until reviewed.

The embedding index must match `works.json` exactly. Commit both generated files together when changing either source CSV. This preserves reproducibility of semantic retrieval. The first local model build downloads `Xenova/all-MiniLM-L6-v2` and subsequent runs can use the model cache.

## Product walkthrough

1. Enter a situated research question.
2. Choose **Both curated collections**, **CRDJ Essential Reading**, or **Black Excellence in LIS / Internet Studies**.
3. Select **Explore scholarship**. The browser embeds the question locally and compares it to the committed publication vectors.
4. Inspect the result list, then select **Explore as map** to see the Neo4j NVL graph.
5. Select publication, collection, contributor, or relationship nodes to inspect provenance and interpretation; follow the source links for bibliographic validation.

The graph uses the Neo4j Visualization Library in the React frontend with telemetry disabled. **This prototype does not run a Neo4j graph database or AuraDB**: data are generated from versioned CSV files and bundled JSON, and the visualization is assembled in the browser. This supports a small, inspectable research prototype without storing participants' questions on a server.

### Relationship semantics

| Relationship | Evidence or derivation | What it means |
| --- | --- | --- |
| `RETRIEVED_FOR` | Browser-local semantic model | The publication was retrieved for the participant's question. |
| `LISTED_IN_COLLECTION` | Raw source bibliography or CRDJ reading list, with row and list position | A curator included the work in a collection; two collection edges expose overlap. |
| `CREDITED_CONTRIBUTOR` | Bibliographic creator field | The record credits a named person; authorship/editor role and identity are provisional. |
| `SEMANTIC_NEIGHBOR` | Cosine similarity of precomputed work vectors, threshold 0.45 | A thematic reading suggestion from the current embedding model. |

Semantic proximity and list membership do **not** prove intellectual influence, collaboration, or historical genealogy. A missing node may reflect source coverage, search ranking, metadata quality, or historical erasure; interpreting a scholarly gap requires additional evidence and community review.

## Evaluation and next research milestones

- Ask pilot participants to trace one finding back to its source and explain how they interpret an edge.
- Test whether the collection filter and overlapping curation nodes help researchers locate themselves in a field.
- Ask about overlooked authors, terms, and collections, especially Black feminist, critical information, and critical race scholarship that conventional indexing excludes.
- Validate bibliographic metadata and distinguish author from editor before institutional research claims.
- Develop a documented contribution process, annotation provenance, and researcher consent before representing community-supplied genealogy claims.
- Evaluate accessibility beyond NVL's default graph labels; the result list supplies an alternative reading mode.

For research involving people, seek any appropriate institutional ethics determination before systematic recruitment or data collection.
