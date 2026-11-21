/**
 * Build a compact semantic index from the curated publication records.
 *
 * Run: npm run embeddings:build
 * This downloads a small, quantized ONNX model once and generates vectors locally.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { pipeline } from '@huggingface/transformers'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const MODEL = 'Xenova/all-MiniLM-L6-v2'
const corpus = JSON.parse(await readFile(resolve(ROOT, 'src/data/works.json'), 'utf8'))

if (!Array.isArray(corpus) || corpus.length === 0) {
  throw new Error('The corpus is empty. Run python3 scripts/prepare_corpus.py first.')
}

const ids = new Set()
for (const work of corpus) {
  if (typeof work.id !== 'string' || typeof work.searchText !== 'string') {
    throw new Error('A corpus record is missing its ID or searchText.')
  }
  if (ids.has(work.id)) throw new Error(`Duplicate work ID: ${work.id}`)
  ids.add(work.id)
}

console.log(`Loading ${MODEL} (q8) for ${corpus.length} works...`)
const extractor = await pipeline('feature-extraction', MODEL, { dtype: 'q8' })
const items = []
const batchSize = 8

for (let start = 0; start < corpus.length; start += batchSize) {
  const batch = corpus.slice(start, start + batchSize)
  const texts = batch.map((work) => work.searchText)
  const vectors = await extractor(texts, { pooling: 'mean', normalize: true })
  const rows = vectors.tolist()
  if (rows.length !== batch.length) throw new Error('Unexpected embedding batch size.')

  for (let i = 0; i < batch.length; i++) {
    // Six decimal places keep the committed index compact without materially
    // changing cosine-similarity ranking for a discovery prototype.
    items.push({ id: batch[i].id, vector: rows[i].map((value) => Math.round(value * 1e6) / 1e6) })
  }
  console.log(`Embedded ${Math.min(start + batchSize, corpus.length)} / ${corpus.length}`)
}

const index = {
  version: 1,
  model: MODEL,
  dtype: 'q8',
  items,
}

const outputPath = resolve(ROOT, 'src/data/workEmbeddings.json')
await writeFile(outputPath, JSON.stringify(index))
console.log(`Saved ${items.length} embeddings to src/data/workEmbeddings.json`)
