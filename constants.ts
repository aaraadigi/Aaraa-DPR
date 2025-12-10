import { DPRRecord } from './types';

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
