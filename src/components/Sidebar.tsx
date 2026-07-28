import type { EcosystemNode, EcosystemRelationship } from './EcosystemTypes'
export default function Sidebar({ node, relationship }: { node?: EcosystemNode; relationship?: EcosystemRelationship }) {
    return (
        <section className="h-full pb-10 w-full bg-gray-800 border rounded-2xl text-white p-4">
            <header className="mb-4">
                <h2 className="text-xl font-bold">Inspector</h2>
            </header>
            <div className="overflow-y-auto h-full overflow-x-hidden max-w-100">
                {node && (
                    <div>
                        <h3 className="text-lg font-semibold">Node Details</h3>
                        <ul className="list-none list-inside">
                            {Object.entries(node.properties).map(([key, value]) => (
                                <li key={key} className="my-2">
                                    <span className="font-bold">{key}</span>: <br />{String(value)}
                                </li>
                            ))}
                        </ul>
                        
                    </div>
                )}
                {relationship && (
                    <div>
                        <h3 className="text-lg font-semibold">Relationship Details</h3>
                        <p>ID: {relationship.id}</p>
                        <p>From: {relationship.from}</p>
                        <p>To: {relationship.to}</p>
                        {Object.entries(relationship.properties).map(([key, value]) => (
                            <p key={key}>
                                <span className="font-bold">{key}</span>: <br /> {String(value)}
                            </p>
                        ))}
                    </div>
                )}
                {!node && !relationship && (
                    <p className=" text-2xl text-gray-500">Click on a node or relationship to see details.</p>
                )}
            </div>
        </section>
    )
}
