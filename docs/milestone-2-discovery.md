# Milestone 2 — Concept-to-scholarship semantic discovery

This milestone introduces **working browser-local AI retrieval** to the existing ecosystem-map application. Researchers can enter a question or cluster of concepts and find nearby publications. Milestone 2 began with the 193-record Black Excellence in LIS / Internet Studies corpus generated in Milestone 1; Milestone 2.1 expands it to 219 distinct works across two curated sources.

## Getting started

```bash
npm ci
npm run dev
```

Visit the local address Vite prints. The scholarly discovery interface opens by default. Type a question and choose **Explore scholarship**.

The first search downloads a small, quantized (`q8`) `Xenova/all-MiniLM-L6-v2` embedding model from its model host. This can take a little time on a slow connection. The browser caches the model where supported. Each later question is embedded in the browser, then compared to previously generated publication vectors. No search API key or hosted inference service is required.

## Milestone 2.1 — Intellectual community map

After a search completes, select **Explore as map**. The map uses the Neo4j NVL React visualization library already in the application; it runs entirely in the browser and does not require Neo4j, AuraDB, or a graph server.

The first map shows a deliberately bounded set of nodes and relationships:

- **Research question**: the participant's inquiry, represented as the map's starting point.
- **Publications**: the works retrieved by the small semantic model.
- **Author credits**: names supplied by the original bibliography, which may require disambiguation and verification.
- **Curated collections**: the Black Excellence bibliography and the [CRDJ Essential Reading list](https://www.raceanddigitaljustice.org/essentialreading), with explicit source membership and shared titles.
- **Bibliographic authorship edges**: explicit source metadata, labeled as unverified.
- **Semantic-neighbor edges**: the closest indexed publication neighbor for each result when similarity is at least 0.45. These are candidates for further reading, *not* documented influence, collaboration, or genealogy.

Click a publication, author credit, or connection to inspect the underlying evidence or interpretation. The unrelated sample funder ecosystem visualization remains in the source code, but is no longer shown to prototype participants.

### Research commitments

This prototype draws inspiration from Dorothy Porter Wesley's careful organization and contextualization of Black knowledge, and Safiya Umoja Noble's case for expert-stewarded public-interest search. A complete Umojography methodology would require additional interpretive work, community participation, critical metadata review, and documented intellectual relations. The graph presently displays *bibliographic structure and computational similarity*, not a verified intellectual genealogy.

See also: Dorothy Porter Wesley, *The Negro in the United States: A Selected Bibliography* (1970), and Safiya Umoja Noble, *Algorithms of Oppression* (2018). For historical context, see [Cataloging Black Knowledge](https://www.historians.org/perspectives-article/cataloging-black-knowledge-how-dorothy-porter-assembled-and-organized-a-premier-africana-research-collection-december-2018/) and [The Search for Ethics](https://annenberg.usc.edu/news/feature/search-ethics). These sources inform our design, not a claim that either scholar proposed this implementation. For data decisions and relationship semantics, see [Milestone 2.1 mapping documentation](milestone-2-1-mapping.md).

## Updating the corpus

When `src/data/works.json` changes, regenerate its vector index:

```bash
npm run embeddings:build
```

Commit `src/data/works.json` and `src/data/workEmbeddings.json` together. The script requires network access on its first run to download the model. The committed index lets a new researcher search without rebuilding all the publication vectors in their browser.

## Research meaning and limits

- Similarity measures proximity in the language of titles and available description notes. It **does not establish** intellectual influence, scholarly collaboration, citation relationships, or bibliometric communities.
- This selective, incompletely verified corpus is a starting sample. A missing work is a **collection gap**, not evidence that the scholarship does not exist.
- All records are marked *unverified*. Some original dates and descriptions appear inconsistent. Validate relevant citations against their original sources before publication or research use.
- The semantic model was not fine-tuned for Black studies, LIS scholarship, or intellectual genealogy. Search results can overlook implicit or historically specific conceptual connections.
- Author names are split from source-provided author credits with a simple heuristic; they have not been independently reconciled to unique identities.
- The unrelated **Example ecosystem graph** remains in the repository for CRDJ work but is hidden from this participant-facing prototype.

## Four-person exploratory pilot

With each participant's agreement, ask them to use one question from their own work, inspect the first eight results, select **Explore as map**, and explain how they understand the displayed relationships. Invite them to name (1) a useful source, (2) a surprising or questionable match, (3) what a semantic-neighbor link should and should not mean, and (4) a scholar, concept, or intellectual community they expected to see but could not find. Document the original question and participant feedback with appropriate safeguards; obtain any required institutional research determination before systematic human-subject research.

The goal of this pilot is to learn about researcher agency and discovery needs, not to claim validated search effectiveness from four informal sessions.
