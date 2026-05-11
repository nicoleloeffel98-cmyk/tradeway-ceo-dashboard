'use client'
import { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileSpreadsheet, CheckCircle2, AlertTriangle,
  Info, ArrowRight, RotateCcw, ChevronRight, X, Database,
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { autoDetectDomain, DOMAIN_LABELS, DOMAIN_SCHEMAS, type DomainKey } from '@/lib/import/schemas'
import { transformSheet, type ImportedData }  from '@/lib/import/transformers'
import { validateSheet, importSummaryLine, type SheetValidation } from '@/lib/import/validators'
import { useImportStore }  from '@/lib/stores/useImportStore'

// ─── Types ───────────────────────────────────────────────────────────────────

type WizardStep = 'upload' | 'mapping' | 'preview' | 'confirm' | 'success'

interface SheetState {
  name:   string
  domain: DomainKey | 'skip'
  rows:   Record<string, unknown>[]
}

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 'upload',  label: 'Upload'  },
  { id: 'mapping', label: 'Map Sheets' },
  { id: 'preview', label: 'Preview'  },
  { id: 'confirm', label: 'Confirm'  },
  { id: 'success', label: 'Done'     },
]

const DOMAIN_OPTIONS: { value: DomainKey | 'skip'; label: string }[] = [
  { value: 'skip',       label: 'Skip this sheet' },
  { value: 'finance',    label: 'Financial Health' },
  { value: 'sales',      label: 'Sales' },
  { value: 'bd',         label: 'Business Development' },
  { value: 'operations', label: 'Operations' },
  { value: 'clients',    label: 'Client Health' },
  { value: 'people',     label: 'People & Capacity' },
]

// ─── Step indicator ──────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: WizardStep }) {
  const currentIdx = STEPS.findIndex((s) => s.id === current)
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done    = i < currentIdx
        const active  = i === currentIdx
        return (
          <div key={step.id} className="flex items-center">
            <div className={cn(
              'flex size-6 items-center justify-center rounded-full text-[10px] font-bold transition-all',
              done   ? 'bg-green-600 text-white'
                     : active ? 'bg-[#e8640c] text-white' : 'bg-muted/40 text-muted-foreground',
            )}>
              {done ? <CheckCircle2 className="size-3.5" /> : i + 1}
            </div>
            <span className={cn(
              'ml-1.5 text-[11px] font-medium hidden sm:block',
              active ? 'text-foreground' : done ? 'text-muted-foreground' : 'text-muted-foreground/40',
            )}>
              {step.label}
            </span>
            {i < STEPS.length - 1 && (
              <ChevronRight className="mx-2 size-3 text-muted-foreground/30 shrink-0" />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Step 1 — Upload ─────────────────────────────────────────────────────────

function StepUpload({ onFile }: { onFile: (file: File) => void }) {
  const [dragging, setDragging] = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    const ok = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')
    if (!ok) { setError('Only .xlsx, .xls, and .csv files are supported.'); return }
    setError(null)
    onFile(file)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[15px] font-bold text-foreground">Upload your spreadsheet</h2>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Upload a .xlsx or .csv file exported from your tracking system.
          The wizard will detect sheets and guide you through mapping.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-12 transition-all',
          dragging ? 'border-[#e8640c] bg-[#e8640c]/5' : 'border-border bg-card/40 hover:border-muted-foreground/40 hover:bg-card/60',
        )}
      >
        <div className={cn('flex size-12 items-center justify-center rounded-full transition-colors',
          dragging ? 'bg-[#e8640c]/15' : 'bg-muted/30')}
        >
          <Upload className={cn('size-5', dragging ? 'text-[#e8640c]' : 'text-muted-foreground')} />
        </div>
        <div className="text-center">
          <p className="text-[13px] font-medium text-foreground">Drop your file here or click to browse</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">.xlsx · .xls · .csv — max 50MB</p>
        </div>
        <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2.5">
          <AlertTriangle className="size-4 text-red-400 shrink-0" />
          <p className="text-[12px] text-red-400">{error}</p>
        </div>
      )}

      {/* Format guide */}
      <div className="rounded-xl border border-border bg-card/40 p-4 space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">Expected spreadsheet format</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {Object.values(DOMAIN_SCHEMAS).map((schema) => (
            <div key={schema.key} className="rounded-lg border border-border bg-card/60 px-3 py-2">
              <p className="text-[11px] font-semibold text-foreground">{schema.label}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{schema.description}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground/60">
          Each domain can be its own sheet tab. Name the sheet tab to match its domain
          (e.g. "Finance", "Sales", "Operations") for automatic detection.
        </p>
      </div>
    </div>
  )
}

// ─── Step 2 — Sheet Mapping ───────────────────────────────────────────────────

function StepMapping({
  sheets, onChange,
}: {
  sheets:   SheetState[]
  onChange: (index: number, domain: DomainKey | 'skip') => void
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[15px] font-bold text-foreground">Map sheets to dashboard domains</h2>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Tell the wizard which sheet contains which type of data.
          Auto-detected assignments are pre-filled — review and adjust as needed.
        </p>
      </div>
      <div className="space-y-2">
        {sheets.map((sheet, i) => (
          <div key={sheet.name} className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-3">
            <FileSpreadsheet className="size-4 shrink-0 text-muted-foreground/60" />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-foreground truncate">{sheet.name}</p>
              <p className="text-[10px] text-muted-foreground">{sheet.rows.length} row{sheet.rows.length !== 1 ? 's' : ''} detected</p>
            </div>
            <select
              value={sheet.domain}
              onChange={(e) => onChange(i, e.target.value as DomainKey | 'skip')}
              className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-[#e8640c]"
            >
              {DOMAIN_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
      {sheets.every((s) => s.domain === 'skip') && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-900/50 bg-amber-950/30 px-3 py-2.5">
          <AlertTriangle className="size-3.5 text-amber-400 shrink-0" />
          <p className="text-[11px] text-amber-400">All sheets are set to Skip — please map at least one sheet to a domain.</p>
        </div>
      )}
    </div>
  )
}

// ─── Step 3 — Preview & Validate ─────────────────────────────────────────────

function StepPreview({ sheets, validations }: { sheets: SheetState[]; validations: SheetValidation[] }) {
  const mapped = sheets.filter((s) => s.domain !== 'skip')

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[15px] font-bold text-foreground">Preview & validate</h2>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Review the first rows and column detection before importing.
        </p>
      </div>

      {mapped.map((sheet, i) => {
        const validation = validations[i]
        return (
          <div key={sheet.name} className="rounded-xl border border-border bg-card/40 overflow-hidden">
            {/* Sheet header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="size-3.5 text-muted-foreground/60" />
                <span className="text-[12px] font-semibold text-foreground">{sheet.name}</span>
                <span className="text-[10px] text-muted-foreground/60">→ {DOMAIN_LABELS[sheet.domain as DomainKey]}</span>
              </div>
              <div className={cn('flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                validation?.isValid
                  ? 'bg-green-950/50 text-green-400'
                  : 'bg-red-950/50 text-red-400',
              )}>
                {validation?.isValid ? <CheckCircle2 className="size-3" /> : <AlertTriangle className="size-3" />}
                {validation?.isValid ? 'Valid' : 'Issues'}
              </div>
            </div>

            {/* Column status */}
            <div className="px-4 py-3 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">Column detection</p>
              <div className="flex flex-wrap gap-1.5">
                {validation?.columns.map((col) => (
                  <span key={col.key} className={cn(
                    'flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium',
                    col.found
                      ? col.required ? 'border-green-900/50 bg-green-950/30 text-green-400'
                                     : 'border-blue-900/40 bg-blue-950/20 text-blue-400'
                      : col.required ? 'border-red-900/50 bg-red-950/30 text-red-400'
                                     : 'border-border bg-muted/20 text-muted-foreground/60',
                  )}>
                    {col.found ? <CheckCircle2 className="size-2.5" /> : <X className="size-2.5" />}
                    {col.label}
                  </span>
                ))}
              </div>

              {/* Warnings */}
              {validation?.warnings.map((w, wi) => (
                <div key={wi} className="flex items-start gap-1.5 text-[10px] text-amber-400">
                  <Info className="size-3 shrink-0 mt-0.5" />
                  {w}
                </div>
              ))}
              {validation?.missingRequired.length > 0 && (
                <div className="flex items-start gap-1.5 text-[10px] text-red-400">
                  <AlertTriangle className="size-3 shrink-0 mt-0.5" />
                  Required columns not found: {validation.missingRequired.join(', ')}
                </div>
              )}
            </div>

            {/* Data preview (first 3 rows) */}
            {sheet.rows.length > 0 && (
              <div className="border-t border-border/50 overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="border-b border-border/30 bg-muted/20">
                      {Object.keys(sheet.rows[0]).slice(0, 6).map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-semibold text-muted-foreground/70 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sheet.rows.slice(0, 3).map((row, ri) => (
                      <tr key={ri} className="border-b border-border/20 last:border-0">
                        {Object.values(row).slice(0, 6).map((val, ci) => (
                          <td key={ci} className="px-3 py-1.5 text-muted-foreground whitespace-nowrap">
                            {String(val ?? '—')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Step 4 — Confirm ────────────────────────────────────────────────────────

function StepConfirm({
  fileName, sheets, validations, onImport, importing,
}: {
  fileName:   string
  sheets:     SheetState[]
  validations: SheetValidation[]
  onImport:   () => void
  importing:  boolean
}) {
  const mapped  = sheets.filter((s) => s.domain !== 'skip')
  const invalid = validations.filter((v) => !v.isValid)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[15px] font-bold text-foreground">Ready to import</h2>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Review the import summary and confirm.
          Dashboard data will update immediately after import.
        </p>
      </div>

      {/* File info */}
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-4">
        <div className="flex size-9 items-center justify-center rounded-lg bg-[#e8640c]/15">
          <FileSpreadsheet className="size-4 text-[#e8640c]" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-foreground">{fileName}</p>
          <p className="text-[11px] text-muted-foreground">
            {mapped.length} sheet{mapped.length !== 1 ? 's' : ''} will update the dashboard
          </p>
        </div>
      </div>

      {/* Sheet summary */}
      <div className="space-y-2">
        {mapped.map((sheet, i) => {
          const validation = validations[i]
          return (
            <div key={sheet.name} className={cn(
              'flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5',
              validation?.isValid ? 'border-border bg-card/40' : 'border-red-900/50 bg-red-950/20',
            )}>
              <div className="flex items-center gap-2 min-w-0">
                {validation?.isValid
                  ? <CheckCircle2 className="size-3.5 text-green-400 shrink-0" />
                  : <AlertTriangle className="size-3.5 text-red-400 shrink-0" />
                }
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-foreground truncate">{sheet.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {DOMAIN_LABELS[sheet.domain as DomainKey]}
                    {validation && ` · ${importSummaryLine(validation)}`}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Invalid sheet warning */}
      {invalid.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-900/50 bg-amber-950/30 px-3 py-2.5">
          <AlertTriangle className="size-3.5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-400">
            {invalid.length} sheet{invalid.length !== 1 ? 's have' : ' has'} missing required columns
            and will be skipped during import.
          </p>
        </div>
      )}

      <button
        onClick={onImport}
        disabled={importing || mapped.length === 0}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e8640c] px-4 py-3 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {importing ? (
          <>
            <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Importing...
          </>
        ) : (
          <>
            <Database className="size-4" />
            Import & Update Dashboard
          </>
        )}
      </button>
    </div>
  )
}

// ─── Step 5 — Success ────────────────────────────────────────────────────────

function StepSuccess({
  fileName, domains, onDone, onImportAnother,
}: {
  fileName:       string
  domains:        string[]
  onDone:         () => void
  onImportAnother: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="flex size-16 items-center justify-center rounded-full bg-green-600/20"
      >
        <CheckCircle2 className="size-8 text-green-400" />
      </motion.div>
      <div>
        <h2 className="text-[17px] font-bold text-foreground">Dashboard updated</h2>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Data from <span className="font-medium text-foreground">{fileName}</span> is now live.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {domains.map((d) => (
          <span key={d} className="rounded-full border border-green-900/50 bg-green-950/30 px-2.5 py-1 text-[11px] font-medium text-green-400">
            {DOMAIN_LABELS[d as DomainKey] ?? d} updated
          </span>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onDone}
          className="flex items-center gap-2 rounded-xl bg-[#e8640c] px-5 py-2.5 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity"
        >
          View Dashboard
          <ArrowRight className="size-4" />
        </button>
        <button
          onClick={onImportAnother}
          className="rounded-xl border border-border px-4 py-2.5 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors"
        >
          Import Another
        </button>
      </div>
    </div>
  )
}

// ─── Main Wizard ─────────────────────────────────────────────────────────────

export function ImportWizard() {
  const router     = useRouter()
  const importData = useImportStore((s) => s.importData)
  const resetDemo  = useImportStore((s) => s.resetToDemo)

  const [step,        setStep]        = useState<WizardStep>('upload')
  const [fileName,    setFileName]    = useState('')
  const [sheets,      setSheets]      = useState<SheetState[]>([])
  const [validations, setValidations] = useState<SheetValidation[]>([])
  const [importing,   setImporting]   = useState(false)
  const [importedDomains, setImportedDomains] = useState<string[]>([])

  // ── Parse file ──────────────────────────────────────────────────────────────
  async function handleFile(file: File) {
    setFileName(file.name)
    const buffer   = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })

    const parsed: SheetState[] = workbook.SheetNames.map((name) => {
      const sheet = workbook.Sheets[name]
      const rows  = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)
      return {
        name,
        domain: autoDetectDomain(name) ?? 'skip',
        rows,
      }
    })

    setSheets(parsed)
    setStep('mapping')
  }

  // ── Update sheet domain mapping ──────────────────────────────────────────────
  function handleMappingChange(index: number, domain: DomainKey | 'skip') {
    setSheets((prev) => prev.map((s, i) => i === index ? { ...s, domain } : s))
  }

  // ── Move to preview — compute validations ────────────────────────────────────
  function handleGoPreview() {
    const mapped = sheets.filter((s) => s.domain !== 'skip')
    const v = mapped.map((s) => validateSheet(s.name, s.domain as DomainKey, s.rows))
    setValidations(v)
    setStep('preview')
  }

  // ── Execute import ───────────────────────────────────────────────────────────
  async function handleImport() {
    setImporting(true)
    await new Promise((r) => setTimeout(r, 600))  // brief async pause for UX

    const mapped  = sheets.filter((s) => s.domain !== 'skip')
    const domains: string[] = []
    let mergedData: ImportedData = {}

    mapped.forEach((sheet, i) => {
      if (!validations[i]?.isValid) return
      const transformed = transformSheet(sheet.domain as DomainKey, sheet.rows)
      mergedData = { ...mergedData, ...transformed }
      domains.push(sheet.domain)
    })

    importData({
      id:         `import-${Date.now()}`,
      fileName,
      importedAt: new Date().toISOString(),
      sheetCount: mapped.length,
      domains,
      data:       mergedData,
    })

    setImportedDomains(domains)
    setImporting(false)
    setStep('success')
  }

  // ── Reset wizard ─────────────────────────────────────────────────────────────
  function reset() {
    setStep('upload')
    setFileName('')
    setSheets([])
    setValidations([])
    setImporting(false)
    setImportedDomains([])
  }

  const mappedSheets       = sheets.filter((s) => s.domain !== 'skip')
  const mappedHasInvalid   = step === 'confirm' && validations.some((v) => !v.isValid && mappedSheets.some((s) => s.domain !== 'skip'))
  const canProceedMapping  = mappedSheets.length > 0
  const currentStepIndex   = STEPS.findIndex((s) => s.id === step)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-bold text-foreground">Import Data</h1>
          <p className="mt-0.5 text-[11px] text-muted-foreground/60">
            Upload a spreadsheet to update dashboard metrics
          </p>
        </div>
        <button
          onClick={() => { resetDemo(); }}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors"
        >
          <RotateCcw className="size-3" />
          Reset to Demo Data
        </button>
      </div>

      {/* Step indicator */}
      {step !== 'success' && (
        <div className="rounded-xl border border-border bg-card/40 px-4 py-3">
          <StepIndicator current={step} />
        </div>
      )}

      {/* Step content */}
      <div className="rounded-xl border border-border bg-card p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            {step === 'upload' && <StepUpload onFile={handleFile} />}

            {step === 'mapping' && (
              <StepMapping
                sheets={sheets}
                onChange={handleMappingChange}
              />
            )}

            {step === 'preview' && (
              <StepPreview
                sheets={sheets.filter((s) => s.domain !== 'skip')}
                validations={validations}
              />
            )}

            {step === 'confirm' && (
              <StepConfirm
                fileName={fileName}
                sheets={sheets.filter((s) => s.domain !== 'skip')}
                validations={validations}
                onImport={handleImport}
                importing={importing}
              />
            )}

            {step === 'success' && (
              <StepSuccess
                fileName={fileName}
                domains={importedDomains}
                onDone={() => router.push('/')}
                onImportAnother={reset}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      {step !== 'upload' && step !== 'success' && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              if (step === 'mapping') setStep('upload')
              if (step === 'preview') setStep('mapping')
              if (step === 'confirm') setStep('preview')
            }}
            className="rounded-lg border border-border px-4 py-2 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </button>

          {step !== 'confirm' && (
            <button
              onClick={() => {
                if (step === 'mapping') handleGoPreview()
                if (step === 'preview') setStep('confirm')
              }}
              disabled={step === 'mapping' && !canProceedMapping}
              className="flex items-center gap-2 rounded-lg bg-[#e8640c] px-4 py-2 text-[12px] font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              Continue
              <ChevronRight className="size-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
