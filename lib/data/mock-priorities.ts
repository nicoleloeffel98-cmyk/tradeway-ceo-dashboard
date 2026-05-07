import type { Priority } from '@/lib/types'

export const mockPriorities: Priority[] = [
  {
    id: 'pri-001',
    title: 'Close Q2 Revenue Gap (R3.8M)',
    progress: 62,
    status: 'amber',
    dueDate: '2026-05-31',
    module: 'sales',
  },
  {
    id: 'pri-002',
    title: 'Resolve AR Backlog (>90 Days)',
    progress: 35,
    status: 'red',
    dueDate: '2026-05-15',
    module: 'finance',
  },
  {
    id: 'pri-003',
    title: 'Reduce Gauteng No-Show Rate Below 5%',
    progress: 20,
    status: 'red',
    dueDate: '2026-05-31',
    module: 'operations',
  },
  {
    id: 'pri-004',
    title: 'Pick n Pay Campaign Launch On Time',
    progress: 80,
    status: 'green',
    dueDate: '2026-06-01',
    module: 'campaigns',
  },
  {
    id: 'pri-005',
    title: 'Complete Q3 Resource Planning',
    progress: 45,
    status: 'amber',
    dueDate: '2026-05-21',
    module: 'people',
  },
]
