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
  { name: 'Bricks', unit: 'nos' },
  { name: 'Solar Panels', unit: 'nos' },
  { name: 'Inverters', unit: 'nos' }
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
  },
  {
    id: 'p6',
    name: 'Waaree Solar Project',
    location: 'Industrial Estate, Chennai',
    siteEngineer: 'Eng. Waaree Team',
    progress: 5,
    status: 'On Track'
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
  },
  {
    id: 't3',
    projectId: 'p6',
    description: 'Site Clearing & Fencing',
    assignedDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Pending'
  }
];

export const INITIAL_DPR_DATA: DPRRecord[] = [];