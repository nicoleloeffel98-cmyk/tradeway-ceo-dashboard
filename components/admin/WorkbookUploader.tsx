'use client'
import { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileSpreadsheet, CheckCircle2, AlertTriangle,
  Info, ArrowRight, RotateCcw, ShieldCheck, TrendingUp,
  Users, DollarSign, Activity, BarChart3,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { parseWorkbook, listSheetNames } from '@/lib/workbook/parser'
import { deriveKPIs } from '@/lib/workbook/deriver'
import { generateIntelligence } from '@/lib/workbook/intelligence'
import { scoreFromBuffer, scoreFromParsed } from '@/lib/workbook/validator'
import { useImportStore } from '@/lib/stores/useImportStore'
import { useAlertsStore } from '@/lib/stores/useAlertsStore'
import { useDecisionsStore } from '@/lib/stores/useDecisionsStore'
import { SHEET_NAMES, REQUIRED_SHEETS, OPTIONAL_SHEETS } from '@/lib/workbook/schema'
import type { ReadinessReport, WorkbookImportRecord } from '@/lib/workbook/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type UploadPhase = 'idle' | 'analysing' | 'preview' | 'activating' | 'done' | 'error'

// ─── Sheet name → icon ────────────────────────────────────────────────────────

const SHEET_ICONS: Record<string, React.ElementType> = {
  [SHEET_NAMES.BD]:         TrendingUp,
  [SHEET_NAMES.SALES]:      DollarSign,
  [SHEET_NAMES.FINANCE]:    BarChart3,
  [SHEET_NAMES.OPERATIONS]: Activity,
  [SHEET_NAMES.CLIENTS]:    Users,
  [SHEET_NAMES.PEOPLE]:     Users,
  [SHEET_NAMES.ALERTS]:     AlertTriangle,
  [SHEET_NAMES.DECISIONS]:  ShieldCheck,
  [SHEET_NAMES.SCENARIOS]:  TrendingUp,
}

// ─── Readiness grade colour ───────────────────────────────────────────────────

const GRADE_STYLE: Record<string, string> = {
  A: 'text-green-400  border-green-800/60  bg-green-950/30',
  B: 'text-green-300  border-green-800/40  bg-green-950/20',
  C: 'text-amber-400  border-amber-800/60  bg-amber-950/30',
  D: 'text-orange-400 border-orange-800/60 bg-orange-950/30',
  F: 'text-red-400    border-red-800/60    bg-red-950/30',
}

// ─── ReadinessBar ─────────────────────────────────────────────────────────────

function ReadinessBar({ score }: { score: number }) {
  const color =
    score >= 80 ? '#16a34a' :
    score >= 60 ? '#d97706' :
    '#dc2626'
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted/30">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ height: '100%', borderRadius: 9999, backgroundColor: color }}
      />
    </div>
  )
}

// ─── DropZone ─────────────────────────────────────────────────────────────────

function DropZone({ onFile }: { onFile: (f: File) => void }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) onFile(f)
  }, [onFile])

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 transition-all',
        dragging
          ? 'border-[#e8640c] bg-[#e8640c]/5'
          : 'border-border/60 hover:border-border hover:bg-muted/10',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xlsm,.xls"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f) }}
      />
      <div className="rounded-full bg-[#e8640c]/10 p-4">
        <Upload className="size-8 text-[#e8640c]" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">Drop your Tradeway workbook here</p>
        <p className="mt-1 text-xs text-muted-foreground">or click to browse — .xlsx, .xlsm, .xls</p>
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {REQUIRED_SHEETS.map((name) => (
          <span key={name} className="rounded border border-border/40 bg-muted/20 px-2 py-0.5 text-[10px] text-muted-foreground">
            {name}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── SheetStatus ─────────────────────────────────────────────────────────────

function SheetStatus({ report }: { report: ReadinessReport }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
        Sheet detection
      </p>
      {report.sheets.map((sheet) => {
        const Icon = SHEET_ICONS[sheet.sheetName] ?? FileSpreadsheet
        return (
          <div key={sheet.sheetName} className="flex items-center gap-2.5 py-1">
            <Icon className={cn('size-3.5 shrink-0', sheet.present ? 'text-foreground' : 'text-muted-foreground/40')} />
            <span className={cn('flex-1 text-[11px]', sheet.present ? 'text-foreground' : 'text-muted-foreground/50 line-through')}>
              {sheet.sheetName}
              {!sheet.required && <span className="ml-1 text-muted-foreground/50">(optional)</span>}
            </span>
            {sheet.present ? (
              <div className="flex items-center gap-1.5">
                {sheet.missingRequired.length > 0 ? (
                  <AlertTriangle className="size-3 text-amber-400" />
                ) : (
                  <CheckCircle2 className="size-3 text-green-500" />
                )}
                <span className={cn('text-[10px] font-mono', sheet.score >= 80 ? 'text-green-400' : sheet.score >= 60 ? 'text-amber-400' : 'text-red-400')}>
                  {sheet.score}%
                </span>
                <span className="text-[10px] text-muted-foreground">{sheet.rowCount} rows</span>
              </div>
            ) : (
              <span className={cn('text-[10px]', sheet.required ? 'text-red-400' : 'text-muted-foreground/40')}>
                {sheet.required ? 'Missing' : 'Not included'}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function WorkbookUploader() {
  const router          = useRouter()
  const importData      = useImportStore((s) => s.importData)
  const resetToDemo     = useImportStore((s) => s.resetToDemo)
  const hasImport       = useImportStore((s) => s.activeImport !== null)
  const activeFile      = useImportStore((s) => s.activeImport?.fileName)
  const setAlerts       = useAlertsStore((s) => s.setImportedAlerts)
  const clearAlerts     = useAlertsStore((s) => s.clearImportedAlerts)
  const setDecisions    = useDecisionsStore((s) => s.setImportedDecisions)
  const clearDecisions  = useDecisionsStore((s) => s.clearImportedDecisions)

  const [phase,    setPhase]    = useState<UploadPhase>('idle')
  const [fileName, setFileName] = useState('')
  const [report,   setReport]   = useState<ReadinessReport | null>(null)
  const [error,    setError]    = useState('')
  const [bufferRef, setBufferRef] = useState<ArrayBuffer | null>(null)

  const handleFile = useCallback(async (file: File) => {
    setPhase('analysing')
    setFileName(file.name)
    setError('')

    try {
      const buffer = await file.arrayBuffer()
      setBufferRef(buffer)

      // Quick readiness score from buffer (no full parse yet)
      const quickReport = scoreFromBuffer(buffer)
      setReport(quickReport)
      setPhase('preview')
    } catch (e) {
      setError(String(e))
      setPhase('error')
    }
  }, [])

  const handleActivate = useCallback(async () => {
    if (!bufferRef) return
    setPhase('activating')

    try {
      const parsed  = parseWorkbook(bufferRef)
      const derived = deriveKPIs(parsed)
      const { alerts, decisions } = generateIntelligence(derived, parsed)
      const finalReport = scoreFromParsed(parsed)

      const record: WorkbookImportRecord = {
        id:             `wb-${Date.now()}`,
        fileName,
        importedAt:     new Date().toISOString(),
        readiness:      finalReport,
        parsed,
        derived,
        generatedAlerts:    alerts,
        generatedDecisions: decisions,
      }

      importData(record)
      setAlerts(alerts)
      setDecisions(decisions)

      setPhase('done')
    } catch (e) {
      setError(String(e))
      setPhase('error')
    }
  }, [bufferRef, fileName, importData, setAlerts, setDecisions])

  const handleReset = () => {
    resetToDemo()
    clearAlerts()
    clearDecisions()
    setPhase('idle')
    setReport(null)
    setBufferRef(null)
    setFileName('')
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-[#e8640c] mb-2">
            <FileSpreadsheet className="size-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Workbook Import</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Tradeway Master Tracking Workbook</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload the official Tradeway workbook. The dashboard derives all KPIs automatically — no mapping required.
          </p>
        </div>

        {/* Active import banner */}
        {hasImport && phase === 'idle' && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-blue-900/40 bg-blue-950/20 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="size-4 text-blue-400" />
              <div>
                <p className="text-sm font-medium text-blue-300">Live data active</p>
                <p className="text-xs text-muted-foreground">{activeFile}</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground"
            >
              <RotateCcw className="size-3" /> Reset to demo
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* Idle / drop zone */}
          {phase === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DropZone onFile={handleFile} />

              {/* Template download */}
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-border/40 bg-muted/10 px-4 py-3">
                <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Need the template? </span>
                  Download the{' '}
                  <a href="/tradeway-master-tracking-template.xlsx" download className="text-[#e8640c] underline underline-offset-2 hover:no-underline">
                    Tradeway Master Tracking Template
                  </a>
                  {' '}— all sheets and column headers are pre-configured.
                </div>
              </div>
            </motion.div>
          )}

          {/* Analysing */}
          {phase === 'analysing' && (
            <motion.div key="analysing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="size-12 rounded-full border-2 border-[#e8640c] border-t-transparent animate-spin" />
              <p className="text-sm text-muted-foreground">Analysing workbook structure…</p>
            </motion.div>
          )}

          {/* Preview */}
          {phase === 'preview' && report && (
            <motion.div key="preview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-5">

              {/* Score card */}
              <div className="rounded-xl border border-border bg-card/60 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Workbook readiness</p>
                    <p className="mt-0.5 text-3xl font-bold font-mono text-foreground">
                      {report.overallScore}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">{fileName}</p>
                  </div>
                  <span className={cn('rounded-lg border px-3 py-1.5 text-xl font-bold tabular-nums', GRADE_STYLE[report.grade])}>
                    {report.grade}
                  </span>
                </div>
                <ReadinessBar score={report.overallScore} />
              </div>

              {/* Sheet detection */}
              <div className="rounded-xl border border-border bg-card/60 p-5">
                <SheetStatus report={report} />
              </div>

              {/* Warnings / suggestions */}
              {report.suggestions.length > 0 && (
                <div className="rounded-xl border border-amber-900/40 bg-amber-950/10 p-4">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-amber-400/80">Suggestions</p>
                  <ul className="space-y-1.5">
                    {report.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <AlertTriangle className="mt-0.5 size-3 shrink-0 text-amber-400" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA */}
              <div className="flex gap-3">
                <button
                  onClick={() => { setPhase('idle'); setReport(null); setBufferRef(null) }}
                  className="flex items-center gap-1.5 rounded-lg border border-border/60 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                >
                  <RotateCcw className="size-3.5" /> Choose different file
                </button>
                <button
                  onClick={handleActivate}
                  disabled={!report.canActivate}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all',
                    report.canActivate
                      ? 'bg-[#e8640c] text-white hover:bg-[#d05a0a]'
                      : 'cursor-not-allowed bg-muted/40 text-muted-foreground',
                  )}
                >
                  {report.canActivate ? (
                    <>Activate live data <ArrowRight className="size-4" /></>
                  ) : (
                    'Not enough data to activate (need 3+ sheets)'
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Activating */}
          {phase === 'activating' && (
            <motion.div key="activating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="size-12 rounded-full border-2 border-[#e8640c] border-t-transparent animate-spin" />
              <p className="text-sm text-muted-foreground">Deriving KPIs and generating executive intelligence…</p>
            </motion.div>
          )}

          {/* Done */}
          {phase === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-6 py-10 text-center">
              <div className="rounded-full bg-green-950/40 p-5 ring-1 ring-green-800/40">
                <CheckCircle2 className="size-10 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Dashboard activated</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  All KPIs, alerts, and decisions are now driven by your workbook data.
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{fileName}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 rounded-lg border border-border/60 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                >
                  <RotateCcw className="size-3.5" /> Reset to demo
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center gap-2 rounded-lg bg-[#e8640c] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d05a0a]"
                >
                  Go to dashboard <ArrowRight className="size-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Error */}
          {phase === 'error' && (
            <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-red-900/50 bg-red-950/20 p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-400" />
                <div>
                  <p className="font-medium text-red-300">Failed to process workbook</p>
                  <p className="mt-1 text-xs text-muted-foreground">{error || 'Unknown error. Ensure the file is a valid .xlsx workbook.'}</p>
                </div>
              </div>
              <button
                onClick={() => setPhase('idle')}
                className="mt-4 flex items-center gap-1.5 rounded-lg border border-red-900/40 px-4 py-2 text-sm text-red-400 transition-colors hover:border-red-700/60"
              >
                <RotateCcw className="size-3.5" /> Try again
              </button>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Schema reference */}
        {(phase === 'idle' || phase === 'preview') && (
          <div className="mt-8 rounded-xl border border-border/40 bg-muted/5 p-5">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Required sheet names (exact)
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {REQUIRED_SHEETS.map((name) => {
                const Icon = SHEET_ICONS[name] ?? FileSpreadsheet
                return (
                  <div key={name} className="flex items-center gap-2 rounded-lg border border-border/30 bg-card/40 px-2.5 py-2">
                    <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="text-[10px] text-foreground font-medium leading-tight">{name}</span>
                  </div>
                )
              })}
              {OPTIONAL_SHEETS.map((name) => {
                const Icon = SHEET_ICONS[name] ?? FileSpreadsheet
                return (
                  <div key={name} className="flex items-center gap-2 rounded-lg border border-dashed border-border/20 bg-card/20 px-2.5 py-2 opacity-60">
                    <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground leading-tight">{name}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
