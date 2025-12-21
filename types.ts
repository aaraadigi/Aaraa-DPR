
export type UserRole = 'maha' | 'dpr' | 'finance' | 'procurement' | 'pm' | 'se' | 'costing' | 'waaree' | 'ops' | 'md' | 'generic' | null;

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
  | 'Raised_By_SE'
  | 'PM_Review'
  | 'QS_Analysis'
  | 'Procurement_Quoting'
  | 'Ops_Approval'
  | 'MD_Final_Approval'
  | 'Finance_Payment_Pending'
  | 'Procurement_Dispatch'
  | 'GRN_Pending'
  | 'Completed'
  | 'Rejected_By_PM'
  | 'Returned_To_SE';

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
  deadline: string;
  indentSheetPhoto?: string;
  procurementComments?: string;
  costingComments?: string;
  marketAnalysis?: string;
  pmComments?: string;
  opsComments?: string;
  mdComments?: string;
  paymentRef?: string;
  poNumber?: string;
  grnDetails?: string;
  grnPhotos?: string[];
  vendorBillPhoto?: string;
  quotes?: string[];
}

export interface PettyCashEntry {
  id: number;
  timestamp: number;
  date: string;
  user_id: string;
  user_name: string;
  amount: number;
  paid_to: string;
  remarks: string;
  screenshot: string;
  status: 'Pending_PM_Approval' | 'Pending_Finance_Disbursement' | 'Completed' | 'Rejected';
  project_name?: string;
  pm_comments?: string;
  finance_comments?: string;
  payment_ref?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  user: string | null;
  userId: string;
}

export interface DailyTask {
  id: number;
  description: string;
  status: 'pending' | 'completed';
  created_at: string;
  user_id: string;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  siteEngineer: string;
  projectManager: string;
  progress: number;
  status: string;
  startDate?: string;
  endDate?: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo?: string;
  projectName?: string;
  dueDate?: string;
  priority?: 'Low' | 'Medium' | 'High';
  response?: string;
  respondedAt?: string;
  assignedBy?: string;
}

export interface Notification {
  id: string;
  timestamp: number;
  message: string;
  type: 'success' | 'warning' | 'info';
  projectName?: string;
}
