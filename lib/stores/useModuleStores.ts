'use client'
import { create } from 'zustand'

interface ModuleUIState {
  activeTab:    string
  setActiveTab: (tab: string) => void
}

const makeModuleStore = (defaultTab = 'overview') =>
  create<ModuleUIState>((set) => ({
    activeTab:    defaultTab,
    setActiveTab: (tab) => set({ activeTab: tab }),
  }))

export const useBDStore         = makeModuleStore()
export const useSalesStore      = makeModuleStore()
export const useFinanceStore    = makeModuleStore()
export const useOpsStore        = makeModuleStore()
export const usePeopleStore     = makeModuleStore()
export const useCampaignsStore  = makeModuleStore()
export const useStrategicStore  = makeModuleStore()
