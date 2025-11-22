export enum JobStatus {
  PENDING = 'PENDING',
  DIAGNOSTICS = 'DIAGNOSTICS',
  PARTS = 'PARTS',
  FIXING = 'FIXING',
  READY = 'READY'
}

export interface CostItem {
  id: string;
  description: string;
  amount: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
}

export interface Job {
  id: string;
  plateNumber: string;
  carModel: string;
  ownerName: string;
  primaryIssue: string;
  status: JobStatus;
  entryDate: string;
  costItems: CostItem[];
  logs: LogEntry[];
  visuals: string[]; // URLs to images
}

export type ViewMode = 'LANDING' | 'DRIVER_SEARCH' | 'DRIVER_STATUS' | 'MECHANIC_DASHBOARD' | 'MECHANIC_JOB_DETAIL' | 'MECHANIC_NEW_JOB';
