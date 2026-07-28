export interface Node {
    id: string
    captions: { value: string }[]
    properties: Record<string, any>
    color: string
}

export const nodeColor = {
    funder: '#0EFF81',
    fundedWork: '#FFDF81'
}
export interface NodeProperties {
    nodeType: 'funder' | 'fundedWork'
    name: string
    website?: string
    lastChecked?: Date
    
}
export interface fundedWorkProperties extends NodeProperties {
    nodeType: 'fundedWork'
    fundedWorkType: 'program' | 'entity' | 'project'
    entityType?:  'nonprofit' | 'university' | 'research institute' | 'community organization' | 'media organization' | 'advocacy group'
    programArea: string
    region: string
    statedGoal: string
    targetCommunities: string[]
    grantAmount: number
    grantYear: number
    grantDuration: string

}
export interface funderProperties extends NodeProperties {
    nodeType: 'funder'
    aka_abbreviation?: string
    website: string
    missionStatement: string
    funderType: 'foundation' | 'philanthropic network' | 'donor collaborative'
    priorityAreas: string[]
    openCallStatus: 'open' | 'closed' | 'unknown'
    color: '#FFDF81'
}
export interface Relationship {
    id: string
    from: string
    to: string
    properties: Record<string, any>
}
export type RelationshipProperties = {
    relationshipType: 'funded'
    grantDate: Date
}


export type EcosystemNode = Node & { properties: NodeProperties }
export type EcosystemRelationship = Relationship & { properties: RelationshipProperties }