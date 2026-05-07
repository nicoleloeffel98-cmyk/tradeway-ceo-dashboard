import type { FinanceDataSource, FinanceServiceResult, NormalisedFinanceData } from './types'
import { FinanceSourceError } from './types'
import { validateFinanceData } from './validate'

// ─── Source implementations ───────────────────────────────────────────────────

async function fetchFromMock(): Promise<NormalisedFinanceData> {
  // Simulate realistic async fetch — exercises loading states
  await new Promise((r) => setTimeout(r, 400 + Math.random() * 400))

  const { mockFinanceKPIs, mockCashFlow, mockARAgingBuckets, mockRevenueVsBudget } =
    await import('@/lib/data/mock-finance')

  const get = (id: string) => mockFinanceKPIs.find((k) => k.id === id)

  return {
    revenueYTD:          get('fin-revenue-ytd')?.value      ?? 194_600_000,
    revenueTarget:       get('fin-revenue-ytd')?.target     ?? 202_000_000,
    ebitdaMargin:        get('fin-ebitda-margin')?.value    ?? 17.9,
    ebitdaTarget:        get('fin-ebitda-margin')?.target   ?? 20,
    grossMargin:         get('fin-gross-margin')?.value     ?? 36.8,
    grossMarginTarget:   get('fin-gross-margin')?.target    ?? 38,
    cashOnHand:          get('fin-cash')?.value             ?? 22_500_000,
    cashTarget:          get('fin-cash')?.target            ?? 20_000_000,
    dso:                 get('fin-dso')?.value              ?? 51,
    dsoTarget:           get('fin-dso')?.target             ?? 45,
    overdueAR:           get('fin-overdue-ar')?.value       ?? 4_200_000,
    overdueARTarget:     get('fin-overdue-ar')?.target      ?? 2_000_000,
    budgetVariance:      get('fin-budget-variance')?.value  ?? -7.3,
    opexRatio:           get('fin-opex-ratio')?.value       ?? 21.4,
    opexRatioTarget:     get('fin-opex-ratio')?.target      ?? 22,
    cashFlow:            mockCashFlow,
    arBuckets:           mockARAgingBuckets,
    revenueVsBudget:     mockRevenueVsBudget,
    periodLabel:         'May 2026',
    fetchedAt:           new Date().toISOString(),
  }
}

async function fetchFromXero(): Promise<NormalisedFinanceData> {
  throw new FinanceSourceError('not_configured', 'xero', 'Xero integration not yet configured — add XERO_CLIENT_ID and XERO_CLIENT_SECRET to .env.local')
}

async function fetchFromSage(): Promise<NormalisedFinanceData> {
  throw new FinanceSourceError('not_configured', 'sage', 'Sage integration not yet configured — add SAGE_API_KEY to .env.local')
}

async function fetchFromSap(): Promise<NormalisedFinanceData> {
  throw new FinanceSourceError('not_configured', 'sap', 'SAP integration not yet configured — add SAP_BASE_URL and SAP_API_KEY to .env.local')
}

async function fetchFromCsv(): Promise<NormalisedFinanceData> {
  throw new FinanceSourceError('not_configured', 'csv', 'CSV source not yet configured — add NEXT_PUBLIC_FINANCE_CSV_PATH to .env.local')
}

async function fetchFromSupabase(): Promise<NormalisedFinanceData> {
  throw new FinanceSourceError('not_configured', 'supabase', 'Supabase integration not yet configured — add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local')
}

// ─── Source router ────────────────────────────────────────────────────────────

const SOURCE_MAP: Record<FinanceDataSource, () => Promise<NormalisedFinanceData>> = {
  mock:     fetchFromMock,
  xero:     fetchFromXero,
  sage:     fetchFromSage,
  sap:      fetchFromSap,
  csv:      fetchFromCsv,
  supabase: fetchFromSupabase,
}

function resolveSource(): FinanceDataSource {
  const raw = process.env.NEXT_PUBLIC_FINANCE_DATA_SOURCE ?? 'mock'
  const valid: FinanceDataSource[] = ['mock', 'xero', 'sage', 'sap', 'csv', 'supabase']
  return valid.includes(raw as FinanceDataSource) ? (raw as FinanceDataSource) : 'mock'
}

// ─── Public entry point ───────────────────────────────────────────────────────

export async function getFinanceData(): Promise<FinanceServiceResult> {
  const source    = resolveSource()
  const fetchedAt = new Date().toISOString()
  const warnings: string[] = []

  let data: NormalisedFinanceData
  let isFallback = false

  try {
    data = await SOURCE_MAP[source]()
  } catch (err) {
    isFallback = true

    if (source !== 'mock') {
      const msg = err instanceof Error ? err.message : String(err)
      warnings.push(`[Fallback] ${source} source failed: ${msg}. Showing mock data.`)
      data = await fetchFromMock()
    } else {
      throw err
    }
  }

  const validation = validateFinanceData(data)
  warnings.push(...validation.warnings)

  if (!validation.valid) {
    warnings.push(`Data validation errors: ${validation.errors.join('; ')}`)
  }

  return { data, source: isFallback ? 'mock' : source, isFallback, warnings, fetchedAt }
}
