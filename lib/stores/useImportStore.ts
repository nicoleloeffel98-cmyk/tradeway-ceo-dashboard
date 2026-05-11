'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WorkbookImportRecord, DerivedKPIs, ParsedWorkbook } from '@/lib/workbook/types'

// Re-export for convenience
export type { WorkbookImportRecord }

interface ImportStore {
  activeImport:   WorkbookImportRecord | null
  importHistory:  WorkbookImportRecord[]

  importData:      (record: WorkbookImportRecord) => void
  resetToDemo:     () => void
  hasImportedData: () => boolean
}

export const useImportStore = create<ImportStore>()(
  persist(
    (set, get) => ({
      activeImport:  null,
      importHistory: [],

      importData: (record) =>
        set((s) => ({
          activeImport:  record,
          importHistory: [record, ...s.importHistory].slice(0, 10),
        })),

      resetToDemo: () => set({ activeImport: null }),

      hasImportedData: () => get().activeImport !== null,
    }),
    {
      name: 'tradeway-import-v2',
      partialize: (s) => ({
        activeImport:  s.activeImport,
        importHistory: s.importHistory,
      }),
    },
  ),
)

// ─── Selector helpers (used by dashboard modules) ─────────────────────────────

/** Get derived KPIs from the active import, or undefined if no import */
export function useDerivedKPIs(): DerivedKPIs | undefined {
  return useImportStore((s) => s.activeImport?.derived)
}

/** Get parsed workbook from the active import, or undefined if no import */
export function useParsedWorkbook(): ParsedWorkbook | undefined {
  return useImportStore((s) => s.activeImport?.parsed)
}
