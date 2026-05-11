'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Database } from 'lucide-react'
import { useAlertsStore }  from '@/lib/stores/useAlertsStore'
import { useImportStore }  from '@/lib/stores/useImportStore'
import { CEO_INITIALS, CEO_NAME, DATA_PERIOD } from '@/lib/constants/ceo'
import { cn } from '@/lib/utils'

const PAGE_TITLES: Record<string, string> = {
  '/':               'CEO Home',
  '/alerts':         'Executive Alerts',
  '/bd':             'Business Development',
  '/sales':          'Sales Control Tower',
  '/finance':        'Financial Indicators',
  '/operations':     'Operations Control Tower',
  '/people':         'People & Capacity',
  '/campaigns':      'Campaign Performance',
  '/strategic':      'Strategic Intelligence',
  '/scorecard':      'Executive Scorecard',
  '/admin/import':   'Import Data',
}

export function TopNav() {
  const pathname      = usePathname()
  const unreadCount   = useAlertsStore((s) => s.unreadCount())
  const hasImport     = useImportStore((s) => s.activeImport !== null)
  const importRecord  = useImportStore((s) => s.activeImport)
  const resetToDemo   = useImportStore((s) => s.resetToDemo)
  const pageTitle     = PAGE_TITLES[pathname] ?? 'Executive Intelligence'
  const [asOf, setAsOf] = useState('')

  useEffect(() => {
    const update = () => {
      const now  = new Date()
      const time = now.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false })
      setAsOf(`Today, ${time}`)
    }
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-foreground hidden sm:block">
          {pageTitle}
        </h1>
        <span className="hidden sm:flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-0.5">
          <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            Live · {DATA_PERIOD}
          </span>
        </span>
        {asOf && (
          <span className="hidden md:block text-[10px] text-muted-foreground/50">
            As of {asOf}
          </span>
        )}
        {hasImport && importRecord && (
          <div className="hidden sm:flex items-center gap-1.5 rounded-md border border-blue-900/50 bg-blue-950/30 px-2.5 py-1">
            <Database className="size-3 text-blue-400" />
            <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide">
              Imported Data
            </span>
            <span className="text-[10px] text-muted-foreground/60 hidden lg:block">
              · {importRecord.fileName}
            </span>
            <button
              onClick={resetToDemo}
              className="ml-1 text-[9px] font-medium text-muted-foreground/50 hover:text-muted-foreground transition-colors underline"
              title="Reset to demo data"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div
          className="hidden sm:flex items-center gap-0.5 rounded-lg bg-muted/40 px-3 py-1.5"
          title="Period filtering available in a future release"
        >
          <span className="text-xs font-semibold text-foreground">{DATA_PERIOD}</span>
          <span className="ml-1 text-[10px] text-muted-foreground/50 hidden md:block">
            {new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        <Link
          href="/alerts"
          className={cn(
            'relative flex size-9 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted/40',
          )}
        >
          <Bell className="size-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <div className="h-8 w-px bg-border" />

        <div
          className="flex size-9 items-center justify-center rounded-lg bg-brand-orange text-xs font-bold text-white"
          title={CEO_NAME}
        >
          {CEO_INITIALS}
        </div>
      </div>
    </header>
  )
}
