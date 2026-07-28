import { useState } from 'react'
import Sidebar from './Sidebar'

import { InteractiveNvlWrapper } from '@neo4j-nvl/react'
import type { Node, Relationship } from '@neo4j-nvl/base'
import { ecosystemNodes, ecosystemRelationships } from './sampleData'

export default function EcosystemViewer() {
  const nodes = ecosystemNodes
  const rels = ecosystemRelationships

  
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

      <div className="h-[80vh] min-h-96 w-full bg-slate-50 p-4">
        <div className="flex h-full gap-4">
          <div className="h-full flex-1 rounded-xl border border-slate-200 bg-white">
            <InteractiveNvlWrapper
            nvlOptions={{
                disableWebWorkers: true, // quick fix: force true
                initialZoom: 1.2,
            }}
              nodes={nodes} // need to reconcile the fact that the sample data is using our defined ecosystem node type, while the InteractiveNvlWrapper expects the Node type from @neo4j-nvl/base
              rels={rels} // same thing for relationships
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

          <div className="h-full max-w-70">
            
            <Sidebar node={selectedNode} relationship={selectedRelationship} />
          </div>
        </div>
      </div>
    </section>
  )
}


