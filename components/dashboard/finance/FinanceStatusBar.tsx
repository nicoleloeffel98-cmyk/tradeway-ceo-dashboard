'use client'
import { RefreshCw, AlertTriangle, Database } from 'lucide-react'
import type { FinanceDataSource } from '@/lib/services/finance/types'

const SOURCE_LABELS: Record<FinanceDataSource, string> = {
  mock:     'Mock data',
  xero:     'Xero',
  sage:     'Sage',
  sap:      'SAP FI',
  csv:      'CSV export',
  supabase: 'Supabase',
}

interface FinanceStatusBarProps {
  dataSource: FinanceDataSource
  fetchedAt:  string
  isFallback: boolean
  warnings:   string[]
  isLoading:  boolean
  onRefetch:  () => void
}

export function FinanceStatusBar({
  dataSource, fetchedAt, isFallback, warnings, isLoading, onRefetch,
}: FinanceStatusBarProps) {
  const time = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false })
    : '—'

  return (
    <div className="space-y-2">
      {/* Primary bar */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-card/60 px-3 py-2">
        <div className="flex items-center gap-2">
          <Database className="size-3 text-muted-foreground/50" />
          <span className="text-[11px] text-muted-foreground">
            Source: <span className="font-medium text-foreground/70">{SOURCE_LABELS[dataSource]}</span>
          </span>
          {isFallback && (
            <span className="rounded border border-amber-800 bg-amber-950 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
              Fallback
            </span>
          )}
          {dataSource === 'mock' && !isFallback && (
            <span className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
              Demo data
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {fetchedAt && (
            <span className="text-[10px] text-muted-foreground/40">
              Updated {time}
            </span>
          )}
          <button
            onClick={onRefetch}
            disabled={isLoading}
            className="flex items-center gap-1 rounded px-2 py-1 text-[11px] text-muted-foreground/60 transition-colors hover:bg-muted/40 hover:text-foreground disabled:opacity-40"
            title="Refresh finance data"
          >
            <RefreshCw className={`size-3 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Fallback / warning banner */}
      {(isFallback || warnings.length > 0) && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-900/40 bg-amber-950/20 px-3 py-2">
          <AlertTriangle className="mt-0.5 size-3 shrink-0 text-amber-500" />
          <div className="space-y-0.5">
            {isFallback && (
              <p className="text-[11px] font-medium text-amber-400">
                Live data source unavailable — showing demo data. Configure{' '}
                <code className="font-mono text-[10px]">NEXT_PUBLIC_FINANCE_DATA_SOURCE</code> to connect a real source.
              </p>
            )}
            {warnings.filter((w) => !w.startsWith('[Fallback]')).map((w, i) => (
              <p key={i} className="text-[11px] text-amber-400/70">{w}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
