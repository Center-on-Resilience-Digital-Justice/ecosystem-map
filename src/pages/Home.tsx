import { useState } from 'react'
import EcosystemViewer from '../components/EcosystemViewer'
import DiscoveryExplorer from '../components/DiscoveryExplorer'

export default function Home() {
  const [view, setView] = useState<'discovery' | 'ecosystem'>('discovery')

  return (
    <main className="min-h-screen w-full bg-slate-50 px-4 pb-16 sm:px-7">
      <div className="mx-auto flex max-w-5xl gap-2 border-b border-slate-200 pt-5">
        <button type="button" onClick={() => setView('discovery')} aria-pressed={view === 'discovery'} className={`rounded-t-lg px-4 py-3 text-sm font-semibold ${view === 'discovery' ? 'border-b-2 border-indigo-700 bg-white text-indigo-800' : 'text-slate-600 hover:text-slate-900'}`}>
          Scholarship discovery
        </button>
        <button type="button" onClick={() => setView('ecosystem')} aria-pressed={view === 'ecosystem'} className={`rounded-t-lg px-4 py-3 text-sm font-semibold ${view === 'ecosystem' ? 'border-b-2 border-indigo-700 bg-white text-indigo-800' : 'text-slate-600 hover:text-slate-900'}`}>
          Example ecosystem graph
        </button>
      </div>
      {view === 'discovery' ? <DiscoveryExplorer /> : <div className="mx-auto mt-7 max-w-6xl"><EcosystemViewer /></div>}
    </main>
  )
}
