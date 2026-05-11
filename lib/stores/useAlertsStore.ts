'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Alert } from '@/lib/types'
import { mockAlerts } from '@/lib/data/mock-alerts'
import type { GeneratedAlert } from '@/lib/workbook/types'

interface AlertsStore {
  alerts:             Alert[]
  importedAlerts:     Alert[]   // derived from workbook import
  markRead:           (id: string) => void
  markAllRead:        () => void
  unreadCount:        () => number
  setImportedAlerts:  (alerts: GeneratedAlert[]) => void
  clearImportedAlerts: () => void
  /** Combined view: imported alerts (if any) take precedence, then mock */
  allAlerts:          () => Alert[]
}

/** Convert a GeneratedAlert to an Alert (shared type) */
function toAlert(g: GeneratedAlert): Alert {
  return {
    id:             g.id,
    severity:       g.severity,
    category:       g.category,
    title:          g.title,
    summary:        g.summary,
    actionRequired: g.actionRequired,
    actionLabel:    g.actionLabel,
    actionUrl:      g.actionUrl,
    createdAt:      g.createdAt,
    isRead:         g.isRead,
  }
}

export const useAlertsStore = create<AlertsStore>()(
  persist(
    (set, get) => ({
      alerts:         mockAlerts,
      importedAlerts: [],

      markRead: (id) =>
        set((s) => ({
          alerts:         s.alerts.map((a) => (a.id === id ? { ...a, isRead: true } : a)),
          importedAlerts: s.importedAlerts.map((a) => (a.id === id ? { ...a, isRead: true } : a)),
        })),

      markAllRead: () =>
        set((s) => ({
          alerts:         s.alerts.map((a) => ({ ...a, isRead: true })),
          importedAlerts: s.importedAlerts.map((a) => ({ ...a, isRead: true })),
        })),

      unreadCount: () => {
        const s = get()
        const source = s.importedAlerts.length > 0 ? s.importedAlerts : s.alerts
        return source.filter((a) => !a.isRead).length
      },

      setImportedAlerts: (generated) =>
        set({ importedAlerts: generated.map(toAlert) }),

      clearImportedAlerts: () =>
        set({ importedAlerts: [] }),

      allAlerts: () => {
        const s = get()
        return s.importedAlerts.length > 0 ? s.importedAlerts : s.alerts
      },
    }),
    {
      name: 'tradeway-alerts',
      partialize: (state) => ({
        alerts:         state.alerts,
        importedAlerts: state.importedAlerts,
      }),
    },
  ),
)
