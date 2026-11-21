import { useState } from 'react'
import { corpus, discoverWorks } from '../services/semanticSearch'
import type { DiscoveryHit } from '../services/semanticSearch'
import ScholarshipMap from './ScholarshipMap'

const startingQuestion = 'How do Black feminist scholars rethink archives, memory, and information access?'
const collectionNames = {
  all: 'Both curated collections',
  crdj: 'CRDJ Essential Reading',
  lis: 'Black Excellence in LIS / Internet Studies',
} as const
type CollectionFilter = keyof typeof collectionNames

export default function DiscoveryExplorer() {
  const [question, setQuestion] = useState(startingQuestion)
  const [searchedQuestion, setSearchedQuestion] = useState('')
  const [hits, setHits] = useState<DiscoveryHit[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [resultView, setResultView] = useState<'list' | 'map'>('list')
  const [collection, setCollection] = useState<CollectionFilter>('all')
  const [searchedCollection, setSearchedCollection] = useState<CollectionFilter>('all')

  async function search() {
    if (!question.trim() || loading) return
    setLoading(true)
    setError('')
    setHits([])
    setSearchedQuestion('')
    setStatus('Preparing search…')

    try {
      const found = await discoverWorks(question, setStatus, 8, collection)
      setHits(found)
      setSearchedQuestion(question.trim())
      setSearchedCollection(collection)
      setResultView('list')
    } catch (reason) {
      console.error('Semantic discovery failed:', reason)
      setError('Search could not start. Check your connection for the first model download, then try again.')
    } finally {
      setLoading(false)
      setStatus('')
    }
  }

  return (
    <section className="mx-auto w-full max-w-5xl py-8 text-slate-900">
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">Intellectual communities · Research prototype</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Discover and map scholarship</h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600">
          Begin with your own question. Find relevant scholarship, map its bibliographic connections,
          inspect sources, and investigate how intellectual communities are represented.
        </p>
      </div>

      <form
        className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm sm:p-7"
        onSubmit={(event) => { event.preventDefault(); void search() }}
      >
        <label htmlFor="research-question" className="block text-sm font-semibold text-slate-800">
          What are you exploring?
        </label>
        <textarea
          id="research-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Enter a research question or a cluster of concepts…"
          className="mt-3 w-full resize-y rounded-xl border border-slate-300 bg-white p-4 text-base text-slate-900 outline-indigo-500 focus:border-indigo-500"
        />
        <div className="mt-4">
          <label htmlFor="discovery-collection" className="block text-sm font-semibold text-slate-800">Search collection</label>
          <select
            id="discovery-collection"
            value={collection}
            onChange={(event) => setCollection(event.target.value as CollectionFilter)}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-indigo-500 sm:w-auto"
          >
            {Object.entries(collectionNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">{corpus.length} distinct works · 2 curated sources · Browser-local semantic matching</p>
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="rounded-xl bg-indigo-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Searching…' : 'Explore scholarship'}
          </button>
        </div>
      </form>

      {loading && <div role="status" aria-live="polite" className="mt-5 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-900">{status}</div>}
      {error && <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">{error}</div>}

      {searchedQuestion && (
        <section className="mt-9" aria-label="Discovery results">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Your discovery landscape</h2>
              <p className="mt-1 text-sm text-slate-600">Top {hits.length} conceptual matches in {collectionNames[searchedCollection]} for “{searchedQuestion}”</p>
            </div>
            <div className="flex gap-2" role="group" aria-label="Choose discovery view">
              <button type="button" aria-pressed={resultView === 'list'} onClick={() => setResultView('list')} className={`rounded-lg px-4 py-2 text-sm font-semibold ${resultView === 'list' ? 'bg-indigo-800 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'}`}>
                Results list
              </button>
              <button type="button" aria-pressed={resultView === 'map'} onClick={() => setResultView('map')} className={`rounded-lg px-4 py-2 text-sm font-semibold ${resultView === 'map' ? 'bg-indigo-800 text-white' : 'border border-indigo-300 bg-indigo-50 text-indigo-800 hover:bg-indigo-100'}`}>
                Explore as map
              </button>
            </div>
          </div>
          {resultView === 'map' ? (
            <ScholarshipMap hits={hits} question={searchedQuestion} />
          ) : <ol className="grid gap-4">
            {hits.map(({ work }, position) => (
              <li key={work.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex gap-4">
                  <span aria-label={`Result ${position + 1}`} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-800">{position + 1}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold leading-snug text-slate-900">{work.title}</h3>
                    <p className="mt-1 text-sm text-slate-700">{work.author || 'Author not recorded'}{work.year ? ` · ${work.year}` : ''}</p>
                    {work.description && <p className="mt-2 text-sm leading-relaxed text-slate-600">{work.description}</p>}
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                      {/^https?:\/\//i.test(work.url) && (
                        <a href={work.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-700 underline underline-offset-4 hover:text-indigo-900">Open source ↗</a>
                      )}
                      <span className="text-slate-500">{work.sources.map((source) => source.collection).join(' + ')}</span>
                      {work.sources.some((source) => source.landingPage) && <a href="https://www.raceanddigitaljustice.org/essentialreading" target="_blank" rel="noopener noreferrer" className="font-semibold text-amber-800 underline">CRDJ reading list ↗</a>}
                      <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-900">Metadata {work.verificationStatus}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>}
          <p className="mt-5 rounded-xl bg-slate-100 p-4 text-sm leading-relaxed text-slate-700">
            <strong>Reading these connections:</strong> This prototype matches the language of your question against publication titles and available notes.
            These collections are selective; a missing result is a gap in this corpus, not evidence of a gap in scholarship.
            Follow source links to verify dates, authorship, and relevance.
          </p>
        </section>
      )}
      {!searchedQuestion && !loading && (
        <p className="mt-5 text-sm text-slate-500">The first search downloads a compact embedding model, which your browser can cache. Subsequent searches reuse it.</p>
      )}
    </section>
  )
}
