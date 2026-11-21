import worksData from '../data/works.json'
import embeddingsData from '../data/workEmbeddings.json'

export type Work = {
  id: string
  title: string
  author: string
  year: number | null
  url: string
  description: string
  searchText: string
  source: { collection: string; file: string; row: number }
  verificationStatus: string
  issues: string[]
}

export type DiscoveryHit = {
  work: Work
  similarity: number
}

export const corpus = worksData as Work[]

const MODEL = 'Xenova/all-MiniLM-L6-v2'
const index = embeddingsData as {
  version: number
  model: string
  dtype: string
  items: { id: string; vector: number[] }[]
}

if (index.version !== 1 || index.model !== MODEL || index.items.length !== corpus.length) {
  throw new Error('The semantic index does not match the corpus. Run npm run embeddings:build.')
}

const workById = new Map(corpus.map((work) => [work.id, work]))

if (index.items.some(({ id }) => !workById.has(id))) {
  throw new Error('The semantic index has unknown work IDs. Rebuild the embeddings.')
}

let extractorPromise: Promise<import('@huggingface/transformers').FeatureExtractionPipelineType> | null = null

type LoadingStatus = (message: string) => void

async function getExtractor(onStatus: LoadingStatus) {
  if (!extractorPromise) {
    onStatus('Downloading the small semantic model (first search only)…')
    extractorPromise = import('@huggingface/transformers')
      .then(({ pipeline, env }) => {
        // Model files are fetched from the model host and cached by the browser.
        // Research questions and publication text are embedded on this device.
        env.allowLocalModels = false
        return pipeline('feature-extraction', MODEL, {
          dtype: 'q8',
          progress_callback: (progress) => {
            if (progress.status === 'progress' && typeof progress.progress === 'number') {
              onStatus(`Preparing the semantic model: ${Math.round(progress.progress)}%`)
            }
          },
        })
      })
      .catch((error: unknown) => {
        extractorPromise = null // permit retry after an interrupted download
        throw error
      })
  }
  return extractorPromise
}

function dot(left: number[], right: number[]): number {
  if (left.length !== right.length) throw new Error('Embedding dimensions do not match.')
  return left.reduce((sum, value, i) => sum + value * right[i], 0)
}

/** Local semantic nearest-neighbor retrieval; rankings do not establish influence or citation. */
export async function discoverWorks(
  question: string,
  onStatus: LoadingStatus = () => {},
  limit = 8,
): Promise<DiscoveryHit[]> {
  const text = question.trim()
  if (!text) return []
  const extractor = await getExtractor(onStatus)
  onStatus('Looking for related scholarship in the collection…')
  const output = await extractor(text, { pooling: 'mean', normalize: true })
  const vector = output.tolist()[0] as number[]

  return index.items
    .map(({ id, vector: workVector }) => ({
      work: workById.get(id)!,
      similarity: dot(vector, workVector),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
}
