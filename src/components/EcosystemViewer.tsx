import { useEffect, useRef } from 'react'

import NVL from '@neo4j-nvl/base'
import {
  ClickInteraction,
  DragNodeInteraction,
  HoverInteraction,
  PanInteraction,
  ZoomInteraction
} from '@neo4j-nvl/interaction-handlers'

export default function EcosystemViewer() {
  const graphContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!graphContainerRef.current) return

    const nodes = [{ id: '0' }, { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }]
    const rels = [{ id: '10', from: '0', to: '1' }, { id: '11', from: '0', to: '2' }, { id: '12', from: '1', to: '3' }, { id: '13', from: '2', to: '4' }]
    const myNvl = new NVL(graphContainerRef.current, nodes, rels)

    new ZoomInteraction(myNvl)
    new PanInteraction(myNvl)
    new DragNodeInteraction(myNvl)
    new ClickInteraction(myNvl, { selectOnClick: true })
    new HoverInteraction(myNvl, { drawShadowOnHover: true })

    return () => {
      myNvl.destroy()
    }
  }, [])

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
      <header className="flex items-center justify-between border-b border-slate-200 bg-linear-to-r from-slate-50 to-white px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Ecosystem Map
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">Graph Viewer</h2>
        </div>
        
      </header>

      <div className="h-[70vh] min-h-96 w-full bg-slate-50 p-4">
        <div
          ref={graphContainerRef}
          className="h-full w-full rounded-xl border border-slate-200 bg-white"
        />
      </div>
    </section>
  )
}


