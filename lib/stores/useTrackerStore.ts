'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TrackerSnapshot, WeekOnWeekDelta } from '@/lib/workbook/trackerTypes'
import { computeWoWDelta } from '@/lib/workbook/weekOnWeek'

const MAX_SNAPSHOTS = 52   // one year of weekly uploads

interface TrackerStore {
  /** All snapshots, newest first */
  snapshots:   TrackerSnapshot[]
  /** Latest snapshot */
  latest:      TrackerSnapshot | null
  /** Previous snapshot (for WoW comparison) */
  previous:    TrackerSnapshot | null
  /** WoW delta — null if fewer than 2 snapshots */
  wowDelta:    WeekOnWeekDelta | null

  /** Add a new snapshot and recompute WoW delta */
  addSnapshot: (snapshot: TrackerSnapshot) => void
  /** Remove a snapshot by id */
  removeSnapshot: (id: string) => void
  /** Clear everything, revert to mock */
  resetToDemo:    () => void
  /** True if at least one snapshot has been uploaded */
  hasData:        () => boolean
}

export const useTrackerStore = create<TrackerStore>()(
  persist(
    (set, get) => ({
      snapshots: [],
      latest:    null,
      previous:  null,
      wowDelta:  null,

      addSnapshot: (snapshot) =>
        set((s) => {
          const updated  = [snapshot, ...s.snapshots].slice(0, MAX_SNAPSHOTS)
          const latest   = updated[0] ?? null
          const previous = updated[1] ?? null
          const wowDelta = latest && previous ? computeWoWDelta(latest, previous) : null
          return { snapshots: updated, latest, previous, wowDelta }
        }),

      removeSnapshot: (id) =>
        set((s) => {
          const updated  = s.snapshots.filter((snap) => snap.id !== id)
          const latest   = updated[0] ?? null
          const previous = updated[1] ?? null
          const wowDelta = latest && previous ? computeWoWDelta(latest, previous) : null
          return { snapshots: updated, latest, previous, wowDelta }
        }),

      resetToDemo: () =>
        set({ snapshots: [], latest: null, previous: null, wowDelta: null }),

      hasData: () => get().snapshots.length > 0,
    }),
    {
      name:        'tradeway-tracker-v1',
      partialize:  (s) => ({
        snapshots: s.snapshots,
        latest:    s.latest,
        previous:  s.previous,
        wowDelta:  s.wowDelta,
      }),
    },
  ),
)
