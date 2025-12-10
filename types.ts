export type UserRole = 'maha' | 'dpr' | null;

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
  labour: LabourEntry[];
  materials: MaterialEntry[];
  activities: ActivityEntry[];
  machinery: string;
  safetyObservations: string;
  risksAndDelays: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  user: string | null;
}