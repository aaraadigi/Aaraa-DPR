import { DPRRecord, Project, ProjectTask } from './types';

export const LABOUR_CATEGORIES = [
  'Barbender',
  'Carpenter',
  'Engineer',
  'Helper',
  'Mason',
  'Supervisor'
];

export const MATERIAL_TYPES = [
  { name: 'Cement', unit: 'Bags' },
  { name: 'M-Sand', unit: 'cft' },
  { name: 'Steel', unit: 'kg' },
  { name: 'Bricks', unit: 'nos' }
];

export const PROJECTS_DATA: Project[] = [
  { 
    id: 'p1', 
    name: 'Mr. Deepak', 
    location: 'Anna Nagar, Chennai', 
    siteEngineer: 'Eng. Ravi', 
    progress: 45, 
    status: 'On Track' 
  },
  { 
    id: 'p2', 
    name: 'Mr. Rama Krishnan', 
    location: 'Adyar, Chennai', 
    siteEngineer: 'Eng. Suresh', 
    progress: 12, 
    status: 'Delayed' 
  },
  { 
    id: 'p3', 
    name: 'Mr. Mahatma', 
    location: 'Velachery, Chennai', 
    siteEngineer: 'Eng. Priya', 
    progress: 78, 
    status: 'On Track' 
  },
  { 
    id: 'p4', 
    name: 'Mrs. Suchitra', 
    location: 'OMR, Chennai', 
    siteEngineer: 'Eng. Vikram', 
    progress: 30, 
    status: 'On Track' 
  },
  { 
    id: 'p5', 
    name: 'Mr. Karthikeyan', 
    location: 'ECR, Chennai', 
    siteEngineer: 'Eng. Anjali', 
    progress: 95, 
    status: 'Completed' 
  }
];

export const INITIAL_TASKS: ProjectTask[] = [
  {
    id: 't1',
    projectId: 'p1',
    description: 'Complete 1st Floor Slab Casting',
    assignedDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'In Progress'
  },
  {
    id: 't2',
    projectId: 'p3',
    description: 'Final Painting Touch-ups',
    assignedDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Pending'
  }
];

export const INITIAL_DPR_DATA: DPRRecord[] = [
  {
    id: 'dpr-101',
    date: '2023-10-25',
    timestamp: 1698211200000,
    submittedBy: 'maha',
    labour: [
      { category: 'Engineer', count: 2 },
      { category: 'Supervisor', count: 1 },
      { category: 'Mason', count: 5 },
      { category: 'Helper', count: 12 }
    ],
    materials: [
      { name: 'Cement', unit: 'Bags', quantity: 50 },
      { name: 'M-Sand', unit: 'cft', quantity: 200 }
    ],
    activities: [
      { id: '1', description: 'Excavation', unit: 'cum', plannedQty: 100, executedQty: 95 },
      { id: '2', description: 'Muram Laying', unit: 'cum', plannedQty: 50, executedQty: 50 }
    ],
    machinery: 'JCB x 1, Roller x 1',
    safetyObservations: 'All workers wearing helmets. No incidents.',
    risksAndDelays: 'Rain expected in evening.'
  },
  {
    id: 'dpr-102',
    date: '2023-10-26',
    timestamp: 1698297600000,
    submittedBy: 'maha',
    labour: [
      { category: 'Engineer', count: 2 },
      { category: 'Carpenter', count: 4 },
      { category: 'Helper', count: 10 }
    ],
    materials: [
      { name: 'Steel', unit: 'kg', quantity: 500 }
    ],
    activities: [
      { id: '1', description: 'Roller Compaction', unit: 'sqm', plannedQty: 200, executedQty: 180 }
    ],
    machinery: 'Roller x 1',
    safetyObservations: 'Safety briefing conducted.',
    risksAndDelays: 'Material delivery delayed by 2 hours.'
  }
];