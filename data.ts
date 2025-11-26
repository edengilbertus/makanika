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

export const INITIAL_JOBS: Job[] = [
  {
    id: '1',
    customerName: 'John Mukasa',
    customerPhone: '0772123456',
    motorcycleModel: 'Boxer 150',
    plateNumber: 'UDJ 234B',
    issueType: 'Brake Repair',
    issueDescription: 'Front brakes not gripping properly, making noise when stopping',
    status: JobStatus.REPAIRING,
    estimatedCost: 25000,
    estimatedPickup: '3:00 PM',
    entryDate: new Date().toISOString(),
    costItems: [
      { id: 'c1', description: 'Brake Pads (Front)', amount: 15000 },
      { id: 'c2', description: 'Brake Cable', amount: 8000 },
      { id: 'c3', description: 'Labor', amount: 5000 },
    ],
    logs: [
      { id: 'l1', timestamp: '09:00 AM', message: 'Motorcycle received. Starting inspection.' },
      { id: 'l2', timestamp: '09:30 AM', message: 'Diagnosis complete. Front brake pads worn out, cable needs replacement.' },
      { id: 'l3', timestamp: '10:15 AM', message: 'Customer approved repair. Starting work.' },
    ],
    visuals: [
      'https://picsum.photos/400/300?random=10'
    ]
  },
  {
    id: '2',
    customerName: 'Sarah Nambi',
    customerPhone: '0701987654',
    motorcycleModel: 'TVS Apache',
    plateNumber: 'UDK 567C',
    issueType: 'Starting Problem',
    issueDescription: 'Bike not starting in the morning, kicks but doesn\'t fire',
    status: JobStatus.DIAGNOSING,
    estimatedCost: 0,
    estimatedPickup: 'TBD',
    entryDate: new Date().toISOString(),
    costItems: [
      { id: 'c4', description: 'Diagnostics', amount: 5000 },
    ],
    logs: [
      { id: 'l4', timestamp: '08:30 AM', message: 'Motorcycle checked in. Customer reports starting issues.' },
      { id: 'l5', timestamp: '09:00 AM', message: 'Checking spark plug and carburetor.' },
    ],
    visuals: []
  },
  {
    id: '3',
    customerName: 'Peter Okello',
    customerPhone: '0772456789',
    motorcycleModel: 'Bajaj Pulsar',
    plateNumber: 'UDL 890D',
    issueType: 'Full Service',
    issueDescription: 'Regular service - oil change, chain adjustment, general check',
    status: JobStatus.READY,
    estimatedCost: 45000,
    estimatedPickup: '11:00 AM',
    entryDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    costItems: [
      { id: 'c5', description: 'Engine Oil (1L)', amount: 25000 },
      { id: 'c6', description: 'Oil Filter', amount: 8000 },
      { id: 'c7', description: 'Chain Lubricant', amount: 5000 },
      { id: 'c8', description: 'Labor', amount: 10000 },
    ],
    logs: [
      { id: 'l6', timestamp: '02:00 PM', message: 'Service started.' },
      { id: 'l7', timestamp: '03:30 PM', message: 'Oil changed, chain adjusted and lubricated.' },
      { id: 'l8', timestamp: '04:00 PM', message: 'Service complete. Ready for pickup!' },
    ],
    visuals: [
      'https://picsum.photos/400/300?random=20'
    ]
  },
  {
    id: '4',
    customerName: 'John Mukasa',
    customerPhone: '0772123456',
    motorcycleModel: 'Boxer 150',
    plateNumber: 'UDJ 234B',
    issueType: 'Tyre Puncture',
    issueDescription: 'Rear tyre puncture, needs patching',
    status: JobStatus.READY,
    estimatedCost: 5000,
    estimatedPickup: '10:00 AM',
    entryDate: new Date(Date.now() - 604800000).toISOString(), // Last week
    costItems: [
      { id: 'c9', description: 'Puncture Repair', amount: 3000 },
      { id: 'c10', description: 'Tube Patch', amount: 2000 },
    ],
    logs: [
      { id: 'l9', timestamp: '09:00 AM', message: 'Tyre removed and checked.' },
      { id: 'l10', timestamp: '09:30 AM', message: 'Puncture repaired. Ready!' },
    ],
    visuals: []
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust1',
    name: 'John Mukasa',
    phone: '0772123456',
    jobs: ['1', '4']
  },
  {
    id: 'cust2',
    name: 'Sarah Nambi',
    phone: '0701987654',
    jobs: ['2']
  },
  {
    id: 'cust3',
    name: 'Peter Okello',
    phone: '0772456789',
    jobs: ['3']
  }
];

export const INITIAL_SMS: SMSNotification[] = [];