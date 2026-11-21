# Milestone 2 — Concept-to-scholarship semantic discovery

This milestone introduces **working browser-local AI retrieval** to the existing ecosystem-map application. Researchers can enter a question or cluster of concepts and find nearby publications in the 193-record Black Excellence in LIS / Internet Studies corpus generated in Milestone 1.

## Getting started

```bash
npm ci
npm run dev
```

Visit the local address Vite prints. The **Scholarship discovery** tab opens by default. Type a question and choose **Explore scholarship**.

The first search downloads a small, quantized (`q8`) `Xenova/all-MiniLM-L6-v2` embedding model from its model host. This can take a little time on a slow connection. The browser caches the model where supported. Each later question is embedded in the browser, then compared to previously generated publication vectors. No search API key or hosted inference service is required.

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
- The previous **Example ecosystem graph** remains available for navigation, but its example funders and nodes are not derived from the publication collection.

## Four-person exploratory pilot

With each participant's agreement, ask them to use one question from their own work, inspect the first eight results, and talk through the connections they recognize. Invite them to name (1) a useful source, (2) a surprising or questionable match, and (3) a scholar, concept, or intellectual community they expected to see but could not find. Document the original question and participant feedback with appropriate safeguards; obtain any required institutional research determination before systematic human-subject research.

The goal of this pilot is to learn about researcher agency and discovery needs, not to claim validated search effectiveness from four informal sessions.
