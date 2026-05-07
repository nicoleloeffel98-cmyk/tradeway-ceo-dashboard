'use client'
import { useState, useEffect, useCallback } from 'react'
import { getFinanceData } from '@/lib/services/finance'
import { transformFinanceData } from '@/lib/services/finance/transform'
import type { TransformedFinanceData } from '@/lib/services/finance/transform'
import type { FinanceDataSource } from '@/lib/services/finance/types'

export interface UseFinanceDataResult extends TransformedFinanceData {
  isLoading:  boolean
  isError:    boolean
  isFallback: boolean
  dataSource: FinanceDataSource
  fetchedAt:  string
  warnings:   string[]
  error:      string | null
  refetch:    () => void
}

export function useFinanceData(): UseFinanceDataResult {
  const [isLoading,  setIsLoading]  = useState(true)
  const [isError,    setIsError]    = useState(false)
  const [isFallback, setIsFallback] = useState(false)
  const [dataSource, setDataSource] = useState<FinanceDataSource>('mock')
  const [fetchedAt,  setFetchedAt]  = useState('')
  const [warnings,   setWarnings]   = useState<string[]>([])
  const [error,      setError]      = useState<string | null>(null)
  const [transformed, setTransformed] = useState<TransformedFinanceData | null>(null)
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setIsError(false)
      setError(null)

      try {
        const result = await getFinanceData()
        if (cancelled) return

        setTransformed(transformFinanceData(result.data))
        setDataSource(result.source)
        setIsFallback(result.isFallback)
        setFetchedAt(result.fetchedAt)
        setWarnings(result.warnings)
      } catch (err) {
        if (cancelled) return
        setIsError(true)
        setError(err instanceof Error ? err.message : 'Unknown error fetching finance data')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [tick])

  const empty: TransformedFinanceData = {
    kpis:            [],
    cashFlow:        [],
    arBuckets:       [],
    revenueVsBudget: [],
    ebitdaValue:     0,
    ebitdaTarget:    20,
  }

  return {
    ...(transformed ?? empty),
    isLoading,
    isError,
    isFallback,
    dataSource,
    fetchedAt,
    warnings,
    error,
    refetch,
  }
}
