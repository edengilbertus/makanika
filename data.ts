import { Job, JobStatus, Customer, SMSNotification } from './types';

export const ISSUE_TYPES = [
  'Engine Problem',
  'Brake Repair',
  'Tyre Puncture',
  'Chain & Sprocket',
  'Electrical Issue',
  'Full Service',
  'Oil Change',
  'Clutch Problem',
  'Starting Problem',
  'Other'
];

// Empty initial data - all jobs come from backend
export const INITIAL_JOBS: Job[] = [];

export const INITIAL_CUSTOMERS: Customer[] = [];

export const INITIAL_SMS: SMSNotification[] = [];