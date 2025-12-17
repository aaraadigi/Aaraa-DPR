
export type UserRole = 'maha' | 'dpr' | 'finance' | 'procurement' | 'pm' | 'se' | 'waaree' | null;

export interface LabourEntry {
  category: string;
  count: number;
  names?: string;
}

export interface MaterialEntry {
  name: string;
  unit: string;
  quantity: number;
}

export interface ActivityEntry {
  id: string;
  description: string;
  unit: string;
  plannedQty: number;
  executedQty: number;
}

export interface DPRRecord {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  timestamp: number;
  submittedBy: string;
  projectName?: string; // Added for Waaree flow
  labour: LabourEntry[];
  materials: MaterialEntry[];
  activities: ActivityEntry[];
  machinery: string;
  safetyObservations: string;
  risksAndDelays: string;
}

export interface RequestItem {
  material: string;
  quantity: number;
  unit: string;
}

export type IndentStatus = 
  | 'Pending_Procurement' // SE submitted, waiting for Procurement check
  | 'Returned_To_SE'      // Procurement sent back for info
  | 'Pending_PM'          // Procurement checked, waiting for PM approval
  | 'Rejected_By_PM'      // PM rejected
  | 'Approved_By_PM'      // PM approved, back to Procurement for PO
  | 'PO_Raised'           // Procurement raised PO, vendor notified
  | 'Goods_Received'      // SE confirmed receipt (GRN)
  | 'Closed';             // Finance cleared payment

export interface MaterialRequest {
  id: string;
  date: string;
  timestamp: number;
  requestedBy: string;
  projectName?: string; // Added to track which site raised the indent
  items: RequestItem[];
  urgency: 'Low' | 'Medium' | 'High';
  status: IndentStatus;
  notes?: string;
  // Workflow fields
  procurementComments?: string; // Stock/Price check notes
  pmComments?: string;          // PM approval/rejection notes
  poNumber?: string;            // Added by Procurement
  grnDetails?: string;          // Added by SE upon receipt
}

export interface Project {
  id: string;
  name: string;
  location: string;
  siteEngineer: string;
  projectManager?: string; // Added to track PM assignment
  progress: number; // 0 to 100
  status: 'On Track' | 'Delayed' | 'Completed';
}

export interface ProjectTask {
  id: string;
  projectId: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  updates?: string; // Notes from SE
}

export interface Notification {
  id: string;
  message: string;
  timestamp: number;
  type: 'info' | 'success' | 'warning';
  projectName?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  user: string | null;
}