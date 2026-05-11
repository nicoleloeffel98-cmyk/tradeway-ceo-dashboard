'use client'
import { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileSpreadsheet, CheckCircle2, AlertTriangle,
  Info, ArrowRight, RotateCcw, Clock, TrendingUp, TrendingDown,
  Minus, Trash2, ChevronDown, ChevronUp,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { parseTracker } from '@/lib/workbook/trackerParser'
import { TRACKER_SHEET_NAME } from '@/lib/workbook/trackerSchema'
import { useTrackerStore } from '@/lib/stores/useTrackerStore'
import type { TrackerSnapshot } from '@/lib/workbook/trackerTypes'
import { formatZAR } from '@/lib/utils/format'

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'idle' | 'parsing' | 'preview' | 'done' | 'error'

// ─── Format helpers ───────────────────────────────────────────────────────────

function pct(n: number) { return `${(n * 100).toFixed(1)}%` }
function M(n: number)   { return `R${(n / 1_000_000).toFixed(1)}M` }

// ─── Preview card ─────────────────────────────────────────────────────────────

function SnapshotPreview({ snap }: { snap: TrackerSnapshot }) {
  return (
    <div className="space-y-4">
      {/* Validation */}
      {snap.validation.warnings.length > 0 && (
        <div className="rounded-lg border border-amber-900/40 bg-amber-950/15 px-4 py-3">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-amber-400/80">Warnings</p>
          {snap.validation.warnings.map((w, i) => (
            <p key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <AlertTriangle className="mt-0.5 size-3 shrink-0 text-amber-400" /> {w}
            </p>
          ))}
        </div>
      )}

      {/* GP summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-border bg-card/60 p-3">
          <p className="text-[10px] text-muted-foreground">YTD Actual GP</p>
          <p className="mt-1 text-lg font-bold font-mono text-foreground">{M(snap.derived.totalActualGP)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{pct(snap.derived.pctToAnnualTarget)} of target</p>
        </div>
        <div className="rounded-lg border border-border bg-card/60 p-3">
          <p className="text-[10px] text-muted-foreground">Full-Year Forecast</p>
          <p className="mt-1 text-lg font-bold font-mono text-foreground">{M(snap.derived.totalForecastGP)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">vs {M(snap.derived.annualTarget)} target</p>
        </div>
        <div className="rounded-lg border border-border bg-card/60 p-3">
          <p className="text-[10px] text-muted-foreground">Reps at Risk</p>
          <p className={cn('mt-1 text-lg font-bold font-mono', snap.derived.atRiskReps.length > 0 ? 'text-amber-400' : 'text-green-400')}>
            {snap.derived.atRiskReps.length}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">below 60% attainment</p>
        </div>
      </div>

      {/* Quarterly */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Quarterly GP</p>
        {(['q1','q2','q3','q4'] as const).map((q) => {
          const d = snap.quarterly[q]
          const prog = d.budget > 0 ? Math.min(1, d.forecast / d.budget) : 0
          return (
            <div key={q} className="flex items-center gap-2">
              <span className="w-8 text-[10px] text-muted-foreground font-semibold uppercase">{q}</span>
              <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                <div className="h-full rounded-full bg-[#e8640c]" style={{ width: `${prog * 100}%` }} />
              </div>
              <span className="w-28 text-right text-[10px] font-mono text-foreground">
                {M(d.actual)} / {M(d.budget)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Rep count */}
      <p className="text-[10px] text-muted-foreground">
        {snap.validation.repCount} reps detected · {snap.validation.knownRepsFound.length} matched to known roster
        {snap.validation.unknownReps.length > 0 && (
          <span className="text-amber-400"> · New: {snap.validation.unknownReps.join(', ')}</span>
        )}
      </p>
    </div>
  )
}

// ─── Snapshot history row ─────────────────────────────────────────────────────

function SnapshotRow({
  snap,
  isLatest,
  isPrevious,
  wowActualDelta,
  onDelete,
}: {
  snap:           TrackerSnapshot
  isLatest:       boolean
  isPrevious:     boolean
  wowActualDelta?: number
  onDelete:       (id: string) => void
}) {
  const Icon = wowActualDelta === undefined ? Minus
             : wowActualDelta > 0 ? TrendingUp : wowActualDelta < 0 ? TrendingDown : Minus

  const iconColor = wowActualDelta === undefined ? 'text-muted-foreground'
                  : wowActualDelta > 50_000 ? 'text-green-400'
                  : wowActualDelta < -50_000 ? 'text-red-400' : 'text-muted-foreground'

  return (
    <div className={cn(
      'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors',
      isLatest ? 'border-[#e8640c]/40 bg-[#e8640c]/5' : 'border-border/40 bg-card/40',
    )}>
      <Icon className={cn('size-4 shrink-0', iconColor)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[11px] font-medium text-foreground">{snap.reportingDate}</p>
          {isLatest   && <span className="rounded bg-[#e8640c]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#e8640c]">LATEST</span>}
          {isPrevious && <span className="rounded bg-muted/40 px-1.5 py-0.5 text-[9px] text-muted-foreground">PREV</span>}
        </div>
        <p className="text-[10px] text-muted-foreground truncate">
          {snap.fileName} · Actual {M(snap.derived.totalActualGP)} · Forecast {M(snap.derived.totalForecastGP)}
          {wowActualDelta !== undefined && Math.abs(wowActualDelta) > 50_000 && (
            <span className={wowActualDelta > 0 ? 'text-green-400' : 'text-red-400'}>
              {' '}({wowActualDelta > 0 ? '+' : ''}{M(wowActualDelta)} vs prev)
            </span>
          )}
        </p>
      </div>
      <button
        onClick={() => onDelete(snap.id)}
        className="shrink-0 rounded p-1 text-muted-foreground/40 transition-colors hover:bg-muted/20 hover:text-muted-foreground"
        title="Remove snapshot"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  )
}

// ─── DropZone ─────────────────────────────────────────────────────────────────

function DropZone({ onFile }: { onFile: (f: File) => void }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onFile(f) }}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-all',
        dragging ? 'border-[#e8640c] bg-[#e8640c]/5' : 'border-border/60 hover:border-border hover:bg-muted/10',
      )}
    >
      <input
        ref={inputRef} type="file" accept=".xlsx,.xlsm,.xls" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f) }}
      />
      <div className="rounded-full bg-[#e8640c]/10 p-4">
        <Upload className="size-7 text-[#e8640c]" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">Drop this week&apos;s Tradeway tracker</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Sheet: <code className="rounded bg-muted/40 px-1 py-0.5 text-[10px]">{TRACKER_SHEET_NAME}</code>
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground/60">
          Filename format: <code>Tracker DDMMYYYY.xlsx</code>
        </p>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function WorkbookUploader() {
  const router          = useRouter()
  const addSnapshot     = useTrackerStore((s) => s.addSnapshot)
  const removeSnapshot  = useTrackerStore((s) => s.removeSnapshot)
  const resetToDemo     = useTrackerStore((s) => s.resetToDemo)
  const snapshots       = useTrackerStore((s) => s.snapshots)
  const latest          = useTrackerStore((s) => s.latest)
  const previous        = useTrackerStore((s) => s.previous)
  const wowDelta        = useTrackerStore((s) => s.wowDelta)

  const [phase,    setPhase]    = useState<Phase>('idle')
  const [preview,  setPreview]  = useState<TrackerSnapshot | null>(null)
  const [error,    setError]    = useState('')
  const [showAll,  setShowAll]  = useState(false)

  const handleFile = useCallback(async (file: File) => {
    setPhase('parsing')
    setError('')
    try {
      const buffer   = await file.arrayBuffer()
      const snapshot = parseTracker(buffer, file.name)
      setPreview(snapshot)
      setPhase('preview')
    } catch (e) {
      setError(String(e))
      setPhase('error')
    }
  }, [])

  const handleActivate = useCallback(() => {
    if (!preview) return
    addSnapshot(preview)
    setPhase('done')
  }, [preview, addSnapshot])

  const handleReset = () => {
    resetToDemo()
    setPhase('idle')
    setPreview(null)
  }

  const displayedSnapshots = showAll ? snapshots : snapshots.slice(0, 5)

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-8">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-[#e8640c] mb-2">
            <FileSpreadsheet className="size-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Weekly Tracker Upload</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Tradeway GP Tracker</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload the weekly tracker to update all GP metrics and generate week-on-week executive insights.
            Each upload is stored as a dated snapshot for comparison.
          </p>
        </div>

        {/* WoW summary (if we have 2+ snapshots) */}
        {wowDelta && (
          <div className="rounded-xl border border-border bg-card/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground">
                Week-on-week: {wowDelta.fromDate} → {wowDelta.toDate}
              </p>
              <span className={cn(
                'rounded-full border px-2 py-0.5 text-[10px] font-bold',
                wowDelta.totalActualDelta > 0
                  ? 'border-green-800/40 bg-green-950/20 text-green-400'
                  : 'border-red-800/40 bg-red-950/20 text-red-400',
              )}>
                {wowDelta.totalActualDelta > 0 ? '+' : ''}{M(wowDelta.totalActualDelta)} actual
              </span>
            </div>
            <ul className="space-y-1">
              {wowDelta.executiveBullets.slice(0, 3).map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="shrink-0 font-mono text-[#e8640c] mt-0.5">{i + 1}.</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Upload area */}
        <AnimatePresence mode="wait">

          {phase === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DropZone onFile={handleFile} />
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-border/30 bg-muted/10 px-4 py-3">
                <Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  The tracker must contain a sheet named exactly <strong className="text-foreground">% Summary TWP</strong>.
                  The filename date (e.g. <code className="text-[10px] bg-muted/40 px-1 rounded">Tracker 11052026.xlsx</code>) sets the reporting week.
                </p>
              </div>
            </motion.div>
          )}

          {phase === 'parsing' && (
            <motion.div key="parsing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="size-10 rounded-full border-2 border-[#e8640c] border-t-transparent animate-spin" />
              <p className="text-sm text-muted-foreground">Parsing tracker…</p>
            </motion.div>
          )}

          {phase === 'preview' && preview && (
            <motion.div key="preview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-4">
              <div className="rounded-xl border border-border bg-card/60 p-5">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Detected reporting week</p>
                    <p className="mt-0.5 text-xl font-bold text-foreground">{preview.reportingDate}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{preview.fileName}</p>
                  </div>
                  <span className={cn(
                    'rounded-lg border px-3 py-1.5 text-xs font-bold',
                    preview.validation.isValid
                      ? 'border-green-800/50 bg-green-950/20 text-green-400'
                      : 'border-amber-800/50 bg-amber-950/20 text-amber-400',
                  )}>
                    {preview.validation.isValid ? '✓ Valid' : '⚠ Issues'}
                  </span>
                </div>
                <SnapshotPreview snap={preview} />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setPhase('idle'); setPreview(null) }}
                  className="flex items-center gap-1.5 rounded-lg border border-border/60 px-4 py-2.5 text-sm text-muted-foreground hover:border-border hover:text-foreground transition-colors"
                >
                  <RotateCcw className="size-3.5" /> Different file
                </button>
                <button
                  onClick={handleActivate}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#e8640c] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#d05a0a] transition-colors"
                >
                  Save snapshot &amp; update dashboard <ArrowRight className="size-4" />
                </button>
              </div>
            </motion.div>
          )}

          {phase === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-5 py-10 text-center">
              <div className="rounded-full bg-green-950/40 p-4 ring-1 ring-green-800/40">
                <CheckCircle2 className="size-9 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Snapshot saved</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Dashboard updated from {preview?.reportingDate}.
                  {snapshots.length > 1 && ' Week-on-week comparison is now live.'}
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setPhase('idle')}
                  className="flex items-center gap-1.5 rounded-lg border border-border/60 px-4 py-2.5 text-sm text-muted-foreground hover:border-border transition-colors">
                  <Upload className="size-3.5" /> Upload another week
                </button>
                <button onClick={() => router.push('/')}
                  className="flex items-center gap-2 rounded-lg bg-[#e8640c] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d05a0a] transition-colors">
                  View dashboard <ArrowRight className="size-4" />
                </button>
              </div>
            </motion.div>
          )}

          {phase === 'error' && (
            <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-red-900/50 bg-red-950/20 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-400" />
                <div>
                  <p className="font-medium text-red-300">Failed to parse tracker</p>
                  <p className="mt-1 text-xs text-muted-foreground">{error || 'Ensure the file is a valid .xlsx and contains "% Summary TWP" sheet.'}</p>
                </div>
              </div>
              <button onClick={() => setPhase('idle')}
                className="mt-4 flex items-center gap-1.5 rounded border border-red-900/40 px-4 py-2 text-sm text-red-400 hover:border-red-700/60 transition-colors">
                <RotateCcw className="size-3.5" /> Try again
              </button>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Snapshot history */}
        {snapshots.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                Snapshot history ({snapshots.length})
              </p>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                <RotateCcw className="size-3" /> Reset to demo
              </button>
            </div>

            <div className="space-y-1.5">
              {displayedSnapshots.map((snap, i) => (
                <SnapshotRow
                  key={snap.id}
                  snap={snap}
                  isLatest={i === 0}
                  isPrevious={i === 1}
                  wowActualDelta={i === 0 && wowDelta ? wowDelta.totalActualDelta : undefined}
                  onDelete={removeSnapshot}
                />
              ))}
            </div>

            {snapshots.length > 5 && (
              <button
                onClick={() => setShowAll((v) => !v)}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border/30 py-2 text-[11px] text-muted-foreground hover:border-border transition-colors"
              >
                {showAll ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                {showAll ? 'Show less' : `Show ${snapshots.length - 5} more`}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
