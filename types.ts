export enum JobStatus {
  CHECKED_IN = 'CHECKED IN',
  DIAGNOSING = 'DIAGNOSING',
  REPAIRING = 'REPAIRING',
  WAITING_PARTS = 'WAITING FOR PARTS',
  READY = 'READY FOR PICKUP'
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
  customerName: string;
  customerPhone: string;
  motorcycleModel: string;
  plateNumber: string;
  issueType: string;
  issueDescription: string;
  status: JobStatus;
  estimatedCost: number;
  estimatedPickup: string;
  entryDate: string;
  costItems: CostItem[];
  logs: LogEntry[];
  visuals: string[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  jobs: string[]; // Job IDs for repair history
}

export type ViewMode = 
  | 'PLATFORM_SELECT'
  | 'LANDING' 
  | 'CUSTOMER_STATUS' 
  | 'CUSTOMER_HISTORY'
  | 'MECHANIC_LOGIN'
  | 'MECHANIC_DASHBOARD' 
  | 'MECHANIC_JOB_DETAIL' 
  | 'MECHANIC_NEW_JOB'
  | 'MECHANIC_CUSTOMER_HISTORY'
  | 'MECHANIC_SPARE_PARTS';

export type Platform = 'customer' | 'mechanic' | null;

export interface SMSNotification {
  id: string;
  phone: string;
  message: string;
  timestamp: string;
  jobId: string;
}
