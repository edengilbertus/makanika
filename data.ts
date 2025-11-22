import { Job, JobStatus } from './types';

export const INITIAL_JOBS: Job[] = [
  {
    id: '1',
    plateNumber: 'UBD 888X',
    carModel: 'Toyota Premio',
    ownerName: 'Musa K.',
    primaryIssue: 'Suspension noise & Oil change',
    status: JobStatus.FIXING,
    entryDate: '2023-10-24T09:00:00',
    costItems: [
      { id: 'c1', description: 'Diagnostics Fee', amount: 50000 },
      { id: 'c2', description: 'KYB Front Shocks (Pair)', amount: 350000 },
      { id: 'c3', description: 'Engine Oil (Shell Helix)', amount: 120000 },
      { id: 'c4', description: 'Labor', amount: 100000 },
    ],
    logs: [
      { id: 'l1', timestamp: '09:30', message: 'Car checked in. Visual inspection started.' },
      { id: 'l2', timestamp: '10:15', message: 'Diagnostics complete. Front shocks worn out.' },
      { id: 'l3', timestamp: '11:00', message: 'Customer approved KYB shock absorbers.' },
    ],
    visuals: [
      'https://picsum.photos/400/300?random=1',
      'https://picsum.photos/400/300?random=2'
    ]
  },
  {
    id: '2',
    plateNumber: 'UBF 420Z',
    carModel: 'Subaru Forester',
    ownerName: 'Sarah N.',
    primaryIssue: 'Overheating in traffic',
    status: JobStatus.DIAGNOSTICS,
    entryDate: '2023-10-24T08:30:00',
    costItems: [
      { id: 'c5', description: 'Diagnostics Fee', amount: 50000 },
    ],
    logs: [
      { id: 'l4', timestamp: '08:45', message: 'Engine hot. Coolant level low.' },
    ],
    visuals: [
      'https://picsum.photos/400/300?random=3'
    ]
  },
  {
    id: '3',
    plateNumber: 'UBK 101A',
    carModel: 'Toyota HiAce (Drone)',
    ownerName: 'Taxi Boss',
    primaryIssue: 'Brake pads replacement',
    status: JobStatus.READY,
    entryDate: '2023-10-23T14:00:00',
    costItems: [
      { id: 'c6', description: 'Brake Pads (Front & Rear)', amount: 280000 },
      { id: 'c7', description: 'Labor', amount: 50000 },
    ],
    logs: [
      { id: 'l5', timestamp: '14:00', message: 'Vehicle received.' },
      { id: 'l6', timestamp: '15:30', message: 'Pads replaced. Test drive done.' },
    ],
    visuals: []
  }
];