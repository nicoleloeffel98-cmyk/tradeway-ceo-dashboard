'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DecisionItem, DecisionStatus } from '@/lib/types'
import { mockDecisions } from '@/lib/data/mock-decisions'
import type { GeneratedDecision } from '@/lib/workbook/types'

interface DecisionsStore {
  decisions:             DecisionItem[]
  importedDecisions:     DecisionItem[]   // derived from workbook import
  actOnDecision:         (id: string, action: DecisionStatus) => void
  pendingCount:          () => number
  setImportedDecisions:  (decisions: GeneratedDecision[]) => void
  clearImportedDecisions: () => void
  /** Combined view: imported decisions (if any) first, then mock */
  allDecisions:          () => DecisionItem[]
}

/** Convert a GeneratedDecision to a DecisionItem (shared type) */
function toDecisionItem(g: GeneratedDecision): DecisionItem {
  return {
    id:              g.id,
    title:           g.title,
    context:         g.context,
    priority:        g.priority,
    module:          g.module,
    deadline:        g.deadline,
    status:          g.status,
    financialStake:  g.financialStake,
  }
}

export const useDecisionsStore = create<DecisionsStore>()(
  persist(
    (set, get) => ({
      decisions:         mockDecisions,
      importedDecisions: [],

      actOnDecision: (id, action) =>
        set((s) => ({
          decisions:         s.decisions.map((d) => (d.id === id ? { ...d, status: action } : d)),
          importedDecisions: s.importedDecisions.map((d) => (d.id === id ? { ...d, status: action } : d)),
        })),

      pendingCount: () => {
        const s = get()
        const source = s.importedDecisions.length > 0 ? s.importedDecisions : s.decisions
        return source.filter((d) => d.status === 'pending').length
      },

      setImportedDecisions: (generated) =>
        set({ importedDecisions: generated.map(toDecisionItem) }),

      clearImportedDecisions: () =>
        set({ importedDecisions: [] }),

      allDecisions: () => {
        const s = get()
        return s.importedDecisions.length > 0 ? s.importedDecisions : s.decisions
      },
    }),
    {
      name: 'tradeway-decisions',
      partialize: (state) => ({
        decisions:         state.decisions,
        importedDecisions: state.importedDecisions,
      }),
    },
  ),
)
