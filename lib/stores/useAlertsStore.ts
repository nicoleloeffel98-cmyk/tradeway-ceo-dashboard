'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Alert } from '@/lib/types'
import { mockAlerts } from '@/lib/data/mock-alerts'

interface AlertsStore {
  alerts:      Alert[]
  markRead:    (id: string) => void
  markAllRead: () => void
  unreadCount: () => number
  allAlerts:   () => Alert[]
}

export const useAlertsStore = create<AlertsStore>()(
  persist(
    (set, get) => ({
      alerts: mockAlerts,

      markRead: (id) =>
        set((s) => ({
          alerts: s.alerts.map((a) => (a.id === id ? { ...a, isRead: true } : a)),
        })),

      markAllRead: () =>
        set((s) => ({
          alerts: s.alerts.map((a) => ({ ...a, isRead: true })),
        })),

      unreadCount: () => get().alerts.filter((a) => !a.isRead).length,

      allAlerts: () => get().alerts,
    }),
    {
      name: 'tradeway-alerts',
      partialize: (state) => ({ alerts: state.alerts }),
    },
  ),
)
