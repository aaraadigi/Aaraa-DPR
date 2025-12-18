
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

export const MATERIAL_INDENT_SUGGESTIONS = [
  'Cement (OPC, PPC, PSC)',
  'Sand (River sand, M-sand)',
  'Aggregates (20mm, 40mm)',
  'Steel (TMT bars, structural steel)',
  'Concrete / Ready-Mix Concrete (RMC)',
  'Bricks (Red bricks, Fly ash bricks)',
  'Blocks (AAC blocks, Solid blocks, Hollow blocks)',
  'Cement mortar',
  'Lime',
  'Stone (Granite, rubble stone)',
  'Wall putty',
  'Cement plaster',
  'Gypsum plaster',
  'RCC slabs',
  'Roofing sheets (GI, color-coated, polycarbonate)',
  'Clay roof tiles',
  'Concrete roof tiles',
  'Floor tiles (Vitrified, ceramic)',
  'Marble',
  'Granite',
  'Kota stone',
  'Waterproofing membranes',
  'Waterproofing chemicals',
  'Wood',
  'Engineered wood',
  'Plywood',
  'Laminates',
  'Aluminium frames',
  'UPVC frames',
  'Glass (Clear, toughened, laminated)',
  'Door & window hardware (hinges, locks, handles)',
  'Paints (Interior, exterior, enamel)',
  'Primers',
  'Sealers',
  'Tile adhesive',
  'Tile grout',
  'False ceiling materials (Gypsum boards, metal grid)',
  'Electrical wires & cables',
  'Switches & sockets',
  'Distribution boards',
  'Light fixtures (LED, street lights)',
  'Earthing materials',
  'Plumbing pipes (PVC, CPVC, UPVC, HDPE)',
  'Valves & fittings',
  'Sanitary ware (WC, wash basin, urinal)',
  'Water tanks',
  'Pumps',
  'Rainwater harvesting components',
  'Construction admixtures',
  'Curing compounds',
  'Grouts',
  'Sealants',
  'Anti-corrosion coatings',
  'Shuttering materials (Plywood, MS plates)',
  'Scaffolding (pipes, couplers)',
  'Binding wire',
  'Nails',
  'Screws',
  'Anchors',
  'Safety materials (helmets, shoes, safety nets)'
];

export const PROJECTS_DATA: Project[] = [
  { 
    id: 'p1', 
    name: 'WAAREE Road Project', 
    location: 'Chennai Site A', 
    siteEngineer: 'Vivek',
    projectManager: 'Mathiazhagan',
    progress: 15, 
    status: 'On Track' 
  },
  { 
    id: 'p2', 
    name: 'WABAG', 
    location: 'Chennai Site B', 
    siteEngineer: 'Eng. Suresh', 
    projectManager: 'Mathiazhagan',
    progress: 45, 
    status: 'On Track' 
  },
  { 
    id: 'p3', 
    name: 'SRM AP', 
    location: 'Andhra Pradesh', 
    siteEngineer: 'Eng. Priya', 
    projectManager: 'Mathiazhagan',
    progress: 30, 
    status: 'On Track' 
  },
  { 
    id: 'p4', 
    name: 'VIBGYOR', 
    location: 'OMR, Chennai', 
    siteEngineer: 'Eng. Vikram', 
    projectManager: 'Mathiazhagan',
    progress: 60, 
    status: 'On Track' 
  }
];

export const INITIAL_TASKS: ProjectTask[] = [];

export const INITIAL_DPR_DATA: DPRRecord[] = [];
