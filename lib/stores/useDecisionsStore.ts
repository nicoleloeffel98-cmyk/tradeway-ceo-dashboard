'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DecisionItem, DecisionStatus } from '@/lib/types'
import { mockDecisions } from '@/lib/data/mock-decisions'

interface DecisionsStore {
  decisions:    DecisionItem[]
  actOnDecision: (id: string, action: DecisionStatus) => void
  pendingCount:  () => number
  allDecisions:  () => DecisionItem[]
}

export const useDecisionsStore = create<DecisionsStore>()(
  persist(
    (set, get) => ({
      decisions: mockDecisions,

      actOnDecision: (id, action) =>
        set((s) => ({
          decisions: s.decisions.map((d) => (d.id === id ? { ...d, status: action } : d)),
        })),

      pendingCount: () => get().decisions.filter((d) => d.status === 'pending').length,

      allDecisions: () => get().decisions,
    }),
    {
      name: 'tradeway-decisions',
      partialize: (state) => ({ decisions: state.decisions }),
    },
  ),
)
