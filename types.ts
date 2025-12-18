
export type UserRole = 'maha' | 'dpr' | 'finance' | 'procurement' | 'pm' | 'se' | 'costing' | 'waaree' | 'ops' | 'md' | null;

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
  date: string;
  timestamp: number;
  submittedBy: string;
  projectName?: string;
  labour: LabourEntry[];
  materials: MaterialEntry[];
  activities: ActivityEntry[];
  machinery: string;
  safetyObservations: string;
  risksAndDelays: string;
  photos?: string[];
}

export interface RequestItem {
  material: string;
  quantity: number;
  unit: string;
}

export type IndentStatus = 
  | 'Raised_By_SE'            // Step 1: Vivek raises
  | 'PM_Review'              // Step 2: Mathiazhagan reviews/edits
  | 'QS_Analysis'            // Step 3: Babu Sir market price check
  | 'Procurement_Quoting'    // Step 4: AI1031 gets 3 quotes
  | 'Ops_Approval'           // Step 5: Shanmugam selects quote
  | 'MD_Final_Approval'      // Step 6: Nandakumar sign-off
  | 'Finance_Payment_Pending'// Step 7: Sudha makes payment
  | 'Procurement_Dispatch'   // Step 8: On the Way
  | 'GRN_Pending'            // Step 9: Site receives, uploads bill+GRN
  | 'Completed'              // Step 10: Final verification
  | 'Rejected_By_PM'         // Terminal
  | 'Returned_To_SE';        // Back to Step 1

export interface MaterialRequest {
  id: string;
  date: string;
  timestamp: number;
  requestedBy: string;
  projectName?: string;
  items: RequestItem[];
  urgency: 'Low' | 'Medium' | 'High';
  status: IndentStatus;
  notes?: string;
  
  // Workflow fields
  procurementComments?: string;
  costingComments?: string;
  marketAnalysis?: string;      // Babu Sir
  pmComments?: string;          // Mathiazhagan
  opsComments?: string;          // Shanmugam
  mdComments?: string;           // Nandakumar
  paymentRef?: string;           // Sudha
  poNumber?: string;
  grnDetails?: string;
  grnPhotos?: string[];          // Signed GRN photo
  vendorBillPhoto?: string;      // Original vendor bill
  quotes?: string[];             // 3 Quotation photos
}

export interface Project {
  id: string;
  name: string;
  location: string;
  siteEngineer: string;
  projectManager?: string;
  progress: number;
  status: 'On Track' | 'Delayed' | 'Completed';
}

export interface ProjectTask {
  id: string;
  projectId: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  updates?: string;
}

export interface Notification {
  id: string;
  message: string;
  timestamp: number;
  type: 'info' | 'success' | 'warning';
  projectName?: string;
  targetRole: UserRole | 'all';
  read: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  user: string | null;
}
