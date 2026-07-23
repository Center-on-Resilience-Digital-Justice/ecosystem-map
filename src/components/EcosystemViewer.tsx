import { useState } from 'react'
import Sidebar from './Sidebar'

import { InteractiveNvlWrapper } from '@neo4j-nvl/react'
import type { Node, Relationship } from '@neo4j-nvl/base'

export default function EcosystemViewer() {
  const nodes = [{ id: '0' }, { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }]
  const rels = [
    { id: '10', from: '0', to: '1' },
    { id: '11', from: '0', to: '2' },
    { id: '12', from: '1', to: '3' },
    { id: '13', from: '2', to: '4' },
    { id: '14', from: '3', to: '2' },
  ]
  const [selectedNode, setSelectedNode] = useState<Node | undefined>(undefined)
  const [selectedRelationship, setSelectedRelationship] = useState<Relationship | undefined>(undefined)


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
        <div className="flex h-full gap-4">
          <div className="h-full flex-1 rounded-xl border border-slate-200 bg-white">
            <InteractiveNvlWrapper
            nvlOptions={{
                disableWebWorkers: true, // quick fix: force true
            }}
              nodes={nodes}
              rels={rels}
              interactionOptions={{
                selectOnClick: true,
                drawShadowOnHover: true,
                
              }}
              mouseEventCallbacks={{
                onNodeClick: (node: Node) => {
                    console.log('Node clicked:', node)
                    setSelectedRelationship(undefined)
                    setSelectedNode(node)
                },
                onRelationshipClick: (relationship: Relationship) => {
                  console.log('Relationship clicked:', relationship)
                  setSelectedNode(undefined)
                  setSelectedRelationship(relationship)
                },
                onZoom: true,
                onPan: true,
                onDrag: true,
                onCanvasClick: () => {
                  setSelectedNode(undefined)
                  setSelectedRelationship(undefined)
                }
              }}
            />
          </div>

          <div className="h-full w-70">
            <Sidebar node={selectedNode} relationship={selectedRelationship} />
          </div>
        </div>
      </div>
    </section>
  )
}


