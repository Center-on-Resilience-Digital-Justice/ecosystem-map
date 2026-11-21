import { useMemo, useState } from 'react'
import { InteractiveNvlWrapper } from '@neo4j-nvl/react'
import type { Node, Relationship } from '@neo4j-nvl/base'
import { semanticSimilarity } from '../services/semanticSearch'
import type { DiscoveryHit, Work } from '../services/semanticSearch'

type GraphEntry =
  | { kind: 'question'; question: string }
  | { kind: 'work'; work: Work }
  | { kind: 'author'; author: string; works: Work[] }
  | { kind: 'collection'; collection: string; landingPage?: string; works: Work[] }

type RelationEntry = {
  kind: 'retrieved' | 'authorship' | 'suggested' | 'curation'
  description: string
  score?: number
  url?: string
}

const colors = {
  question: '#4338ca',
  work: '#2563eb',
  author: '#0f766e',
  collection: '#b45309',
  retrieved: '#cbd5e1',
  authorship: '#0d9488',
  curation: '#f59e0b',
  suggested: '#a78bfa',
}

function abbreviate(value: string, max = 29): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

/** The source uses comma-delimited author credits and, occasionally, semicolons. */
function creditedAuthors(value: string): string[] {
  if (!value.trim()) return []
  const credits = value.includes(';')
    ? value.split(';')
    : value.split(/,\s*|\s+(?:and|&)\s+/i)
  return [...new Set(credits.map((credit) => credit.trim()).filter(Boolean))]
}

function makeGraph(hits: DiscoveryHit[], question: string) {
  const nodes: Node[] = [{ id: 'question', caption: 'Your question', color: colors.question, size: 43 }]
  const rels: Relationship[] = []
  const entries = new Map<string, GraphEntry>([['question', { kind: 'question', question }]])
  const relations = new Map<string, RelationEntry>()
  const authorCredits = new Map<string, Work[]>()
  const curatedCollections = new Map<string, { works: Work[]; landingPage?: string }>()

  for (const { work } of hits) {
    const workId = `work:${work.id}`
    nodes.push({ id: workId, caption: abbreviate(work.title), color: colors.work, size: 27 })
    entries.set(workId, { kind: 'work', work })

    const matchId = `retrieved:${work.id}`
    rels.push({ id: matchId, from: 'question', to: workId, type: 'RETRIEVED_FOR', color: colors.retrieved })
    relations.set(matchId, {
      kind: 'retrieved',
      description: 'This publication was retrieved for the research question using semantic search.',
    })

    for (const author of creditedAuthors(work.author)) {
      const authored = authorCredits.get(author) || []
      authored.push(work)
      authorCredits.set(author, authored)
    }
    for (const source of work.sources) {
      const existing = curatedCollections.get(source.collection) || { works: [], landingPage: source.landingPage }
      existing.works.push(work)
      curatedCollections.set(source.collection, existing)
    }
  }

  for (const [collection, entry] of curatedCollections) {
    const collectionId = `collection:${collection}`
    nodes.push({ id: collectionId, caption: abbreviate(collection, 27), color: colors.collection, size: 29 })
    entries.set(collectionId, { kind: 'collection', collection, ...entry })
    for (const work of entry.works) {
      const source = work.sources.find((candidate) => candidate.collection === collection)!
      const relationId = `curation:${collection}:${work.id}`
      rels.push({ id: relationId, from: collectionId, to: `work:${work.id}`, type: 'LISTED_IN_COLLECTION', color: colors.curation, width: 2 })
      relations.set(relationId, {
        kind: 'curation',
        url: source.landingPage,
        description: `This publication appears in the ${collection} source (row ${source.row}${source.curatedPosition ? `, reading-list position ${source.curatedPosition}` : ''}). This is documented collection membership, not evidence of intellectual influence.`,
      })
    }
  }

  for (const [author, works] of authorCredits) {
    const authorId = `author:${author}`
    nodes.push({ id: authorId, caption: abbreviate(author, 23), color: colors.author, size: 20 })
    entries.set(authorId, { kind: 'author', author, works })
    for (const work of works) {
      const relationId = `authorship:${author}:${work.id}`
      rels.push({
        id: relationId,
        from: authorId,
        to: `work:${work.id}`,
        type: 'CREDITED_CONTRIBUTOR',
        color: colors.authorship,
        width: 2,
      })
      relations.set(relationId, {
        kind: 'authorship',
        description: 'A name credited as author or editor in the source bibliography. The contribution role and person identity require further verification.',
      })
    }
  }

  // Include only the strongest semantic neighbor for each work. These are
  // proposed reading paths, NEVER evidence of collaboration or influence.
  const seen = new Set<string>()
  for (const { work } of hits) {
    const neighbors = hits
      .filter((candidate) => candidate.work.id !== work.id)
      .map((candidate) => ({
        work: candidate.work,
        score: semanticSimilarity(work.id, candidate.work.id) ?? 0,
      }))
      .sort((a, b) => b.score - a.score)
    const nearest = neighbors[0]
    if (!nearest || nearest.score < 0.45) continue

    const pair = [work.id, nearest.work.id].sort().join(':')
    if (seen.has(pair)) continue
    seen.add(pair)

    const relationId = `similarity:${pair}`
    rels.push({
      id: relationId,
      from: `work:${work.id}`,
      to: `work:${nearest.work.id}`,
      type: 'SEMANTIC_NEIGHBOR',
      color: colors.suggested,
      width: 2,
    })
    relations.set(relationId, {
      kind: 'suggested',
      score: nearest.score,
      description: 'The embedding model identifies similar language across the records. This is a suggestion for investigation, not a documented intellectual relationship.',
    })
  }

  return { nodes, rels, entries, relations, authorCount: authorCredits.size }
}

export default function ScholarshipMap({ hits, question }: { hits: DiscoveryHit[]; question: string }) {
  const graph = useMemo(() => makeGraph(hits, question), [hits, question])
  const [selectedNodeId, setSelectedNodeId] = useState('question')
  const [selectedRelationId, setSelectedRelationId] = useState('')
  const selected = graph.entries.get(selectedNodeId)
  const relation = graph.relations.get(selectedRelationId)

  return (
    <section aria-label="Intellectual community map" className="mt-5 overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
      <header className="border-b border-slate-200 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Explore the intellectual landscape</h3>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Follow publications, collection membership, source-supplied contributor credits, and suggested thematic neighbors.
              Select a node or connection to inspect its meaning.
            </p>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            {hits.length} works · {graph.authorCount} contributor credits
          </span>
        </div>
      </header>

      <div className="grid min-h-[560px] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_310px]">
        <div className="h-[480px] min-w-0 bg-slate-50 lg:h-[560px]" aria-label="Interactive NVL graph">
          <InteractiveNvlWrapper
            key={hits.map(({ work }) => work.id).join('|')}
            nodes={graph.nodes}
            rels={graph.rels}
            nvlOptions={{ disableTelemetry: true, disableWebWorkers: true, initialZoom: 0.75 }}
            interactionOptions={{ selectOnClick: true, drawShadowOnHover: true }}
            mouseEventCallbacks={{
              onNodeClick: (node: Node) => {
                setSelectedNodeId(node.id)
                setSelectedRelationId('')
              },
              onRelationshipClick: (item: Relationship) => {
                setSelectedRelationId(item.id)
                setSelectedNodeId('')
              },
              onCanvasClick: () => {
                setSelectedNodeId('question')
                setSelectedRelationId('')
              },
              onZoom: true,
              onPan: true,
              onDrag: true,
            }}
          />
        </div>

        <aside className="border-t border-slate-200 p-5 lg:border-l lg:border-t-0" aria-live="polite">
          {relation ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Relationship evidence</p>
              <h4 className="mt-2 text-lg font-semibold text-slate-900">
                {relation.kind === 'suggested' ? 'Suggested semantic neighbor' : relation.kind === 'authorship' ? 'Bibliographic credit' : relation.kind === 'curation' ? 'Curated collection membership' : 'Query match'}
              </h4>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">{relation.description}</p>
              {relation.url && <a href={relation.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-semibold text-indigo-700 underline">Inspect the reading list ↗</a>}
              {relation.score !== undefined && <p className="mt-3 text-xs text-slate-500">Model similarity: {relation.score.toFixed(2)} (not a confidence in influence)</p>}
            </>
          ) : selected?.kind === 'work' ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Publication</p>
              <h4 className="mt-2 text-base font-semibold leading-snug text-slate-900">{selected.work.title}</h4>
              <p className="mt-3 text-sm text-slate-700">{selected.work.author || 'Author not recorded'}{selected.work.year ? ` · ${selected.work.year}` : ''}</p>
              {selected.work.description && <p className="mt-3 text-sm leading-relaxed text-slate-600">{selected.work.description}</p>}
              <p className="mt-4 text-xs leading-relaxed text-slate-500">Metadata {selected.work.verificationStatus}. Listed in:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-600">
                {selected.work.sources.map((source) => <li key={source.collection}>{source.collection} · row {source.row}{source.curatedPosition ? ` · selection ${source.curatedPosition}` : ''}{source.landingPage && <> · <a href={source.landingPage} target="_blank" rel="noopener noreferrer" className="text-indigo-700 underline">Reading list</a></>}</li>)}
              </ul>
              {(selected.work.url.startsWith('https://') || selected.work.url.startsWith('http://')) && (
                <a className="mt-4 inline-block text-sm font-semibold text-indigo-700 underline underline-offset-4" href={selected.work.url} target="_blank" rel="noopener noreferrer">Open original source ↗</a>
              )}
            </>
          ) : selected?.kind === 'author' ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">Bibliographic contributor credit</p>
              <h4 className="mt-2 text-lg font-semibold text-slate-900">{selected.author}</h4>
              <p className="mt-3 text-sm text-slate-700">{selected.works.length} represented {selected.works.length === 1 ? 'publication' : 'publications'} in these results.</p>
              <ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-slate-600">
                {selected.works.map((work) => <li key={work.id}>{work.title}</li>)}
              </ul>
              <p className="mt-4 text-xs text-slate-500">Names are drawn from unverified source metadata; creator roles and identity resolution are future work.</p>
            </>
          ) : selected?.kind === 'collection' ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Curated collection</p>
              <h4 className="mt-2 text-lg font-semibold text-slate-900">{selected.collection}</h4>
              <p className="mt-3 text-sm text-slate-700">{selected.works.length} {selected.works.length === 1 ? 'publication' : 'publications'} from this collection appear in these results.</p>
              <p className="mt-3 text-sm text-slate-600">Collection membership reflects editorial and bibliographic choices. It offers context for further inquiry.</p>
              {selected.landingPage && <a href={selected.landingPage} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-semibold text-indigo-700 underline">Read the source collection ↗</a>}
            </>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Researcher inquiry</p>
              <h4 className="mt-2 text-lg font-semibold text-slate-900">Your research question</h4>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">{question}</p>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">The map begins with your inquiry. Connected publications come from the semantic search results, not a validated genealogy.</p>
            </>
          )}
        </aside>
      </div>

      <footer className="border-t border-slate-200 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-700">
          <span><span className="mr-2 inline-block h-3 w-3 rounded-full bg-indigo-700" />Research question</span>
          <span><span className="mr-2 inline-block h-3 w-3 rounded-full bg-blue-600" />Publication</span>
          <span><span className="mr-2 inline-block h-3 w-3 rounded-full bg-teal-700" />Author credit</span>
          <span><span className="mr-2 inline-block h-3 w-3 rounded-full bg-amber-600" />Curated collection</span>
          <span><span className="mr-2 inline-block h-1 w-4 bg-violet-400 align-middle" />AI-suggested proximity</span>
        </div>
        <p className="mt-3 max-w-4xl text-xs leading-relaxed text-slate-600">
          This is an exploratory map of two selective bibliographies. Source records provide provisional contributor credits and documented list membership.
          Semantic links are computational suggestions, not proof of influence, mentorship, or collaboration.
          Missing nodes reflect the current collection and retrieval process, not the absence of scholarship.
        </p>
      </footer>
    </section>
  )
}
