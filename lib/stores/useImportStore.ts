'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ImportedData } from '@/lib/import/transformers'

export interface ImportRecord {
  id:         string
  fileName:   string
  importedAt: string
  sheetCount: number
  domains:    string[]
  data:       ImportedData
}

interface ImportStore {
  activeImport:   ImportRecord | null
  importHistory:  ImportRecord[]
  importData:     (record: ImportRecord) => void
  resetToDemo:    () => void
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
      name: 'tradeway-import',
      partialize: (s) => ({
        activeImport:  s.activeImport,
        importHistory: s.importHistory,
      }),
    },
  ),
)
