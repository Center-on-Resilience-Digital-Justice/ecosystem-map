import type { Node, Relationship } from '@neo4j-nvl/base'
export default function Sidebar({ node, relationship }: { node?: Node; relationship?: Relationship }) {
    return (
        <section className="h-full w-full bg-gray-800 border rounded-2xl text-white p-4">
            <header className="mb-4">
                <h2 className="text-xl font-bold">Inspector</h2>
            </header>
            <div className="overflow-y-auto h-full">
                {node && (
                    <div>
                        <h3 className="text-lg font-semibold">Node Details</h3>
                        <p>ID: {node.id}</p>
                        
                    </div>
                )}
                {relationship && (
                    <div>
                        <h3 className="text-lg font-semibold">Relationship Details</h3>
                        <p>ID: {relationship.id}</p>
                        <p>Type: {relationship.type}</p>
                        <p>From: {relationship.from}</p>
                        <p>To: {relationship.to}</p>      
                    </div>
                )}
            </div>
        </section>
    )
}
