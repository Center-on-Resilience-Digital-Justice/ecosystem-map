import type { EcosystemNode, EcosystemRelationship } from './EcosystemTypes'
import { nodeColor } from './EcosystemTypes'


export { ecosystemNodes, ecosystemRelationships }
const ecosystemNodes: EcosystemNode[] = [
    {
      id: '0',
      captions: [{ value: 'Example Funder A' }],
      color: nodeColor.funder,
      properties: {
        nodeType: 'funder',
        name: 'Example Funder A',
        website: 'https://example.org',
        missionStatement: 'Supporting innovative projects.',
        funderType: 'foundation',
        priorityAreas: ['Education', 'Health'],
        openCallStatus: 'open'
      }
    },
    {
      id: '1',
      captions: [{ value: 'Project X' }],
      color: nodeColor.fundedWork,
      properties: {
        name: 'Project X',
        nodeType: 'fundedWork',
        fundedWorkType: 'project',
        programArea: 'Education',
        region: 'North America',
        statedGoal: 'lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        targetCommunities: ['Students', 'Teachers'],
        grantAmount: 50000,
        grantYear: 2023,
        grantDuration: '1 year',
      }
    },
    {
        id: '6',
        captions: [{ value: 'Project Y' }],
        color: nodeColor.fundedWork,
        properties: {
          name: 'Project Y',
          nodeType: 'fundedWork',
          fundedWorkType: 'project',
          programArea: 'Health',
          region: 'Europe',
          statedGoal: 'lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          targetCommunities: ['Patients', 'Healthcare Providers'],
          grantAmount: 75000,
          grantYear: 2023,
          grantDuration: '2 years',
        }
    },
    {
        id: '2',
        captions: [{ value: 'Ford Foundation' }],
      color: nodeColor.funder,
        properties: {
          nodeType: 'funder',
          name: 'Ford Foundation',
          website: 'https://www.fordfoundation.org/',
          missionStatement: 'lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          funderType: 'foundation',
          priorityAreas: ['Social Justice', 'Human Rights'],
          openCallStatus: 'closed'
        }
      },
      
      {
        id: '3',
        captions: [{ value: 'Open Society Foundations' }],
        color: nodeColor.funder,
        properties: {
          nodeType: 'funder',
          name: 'Open Society Foundations',
          website: 'https://www.opensocietyfoundations.org/',
          missionStatement: 'lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          funderType: 'foundation',
          priorityAreas: ['Democracy', 'Human Rights'],
          openCallStatus: 'open'
        }
      },
      
      {
        id: '4',
        captions: [{ value: 'Rockefeller Foundation' }],
        color: nodeColor.funder,
        properties: {
          nodeType: 'funder',
          name: 'Rockefeller Foundation',
          website: 'https://www.rockefellerfoundation.org/',
          missionStatement: 'lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          funderType: 'foundation',
          priorityAreas: ['Health', 'Sustainability'],
          openCallStatus: 'closed'
        }
      },
      
      {
        id: '5',
        captions: [{ value: 'Kapor Center' }],
        color: nodeColor.funder,
        properties: {
          nodeType: 'funder',
          name: 'Kapor Center',
          website: 'https://www.kaporcenter.org/',
          missionStatement: 'lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          funderType: 'foundation',
          priorityAreas: ['Diversity', 'Inclusion'],
          openCallStatus: 'open'
        }
      }
  ]


  const ecosystemRelationships: EcosystemRelationship[] = [
    {
      id: '10',
      from: '0',
      to: '1',
      properties: {
        relationshipType: 'funded',
        grantDate: new Date('2023-01-15')
      }
    },
    {
      id: '11',
      from: '2',
      to: '1',
      properties: {
        relationshipType: 'funded',
        grantDate: new Date('2023-02-20')
      }
    },
    {
      id: '12',
      from: '3',
      to: '6',
      properties: {
        relationshipType: 'funded',
        grantDate: new Date('2023-03-10')
      }
    },
    
  ] 