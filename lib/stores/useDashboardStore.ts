'use client'
import { create } from 'zustand'
import type { Period } from '@/lib/types'

interface DashboardStore {
  period:         Period
  sidebarOpen:    boolean
  setPeriod:      (period: Period) => void
  setSidebarOpen: (open: boolean) => void
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  period:         'MTD',
  sidebarOpen:    true,
  setPeriod:      (period)     => set({ period }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}))
