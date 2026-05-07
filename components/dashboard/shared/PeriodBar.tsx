'use client'
import { useEffect, useState } from 'react'
import { Separator } from '@/components/ui/separator'
import { DATA_PERIOD } from '@/lib/constants/ceo'

interface PeriodBarProps {
  scope?: string
}

export function PeriodBar({ scope = 'All regions' }: PeriodBarProps) {
  const [asOf, setAsOf] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const time = now.toLocaleTimeString('en-ZA', {
        hour: '2-digit', minute: '2-digit', hour12: false,
      })
      setAsOf(`Today, ${time}`)
    }
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center justify-between">
      <Separator className="flex-1" />
      <div className="flex items-center gap-2 px-3 text-[10px] text-muted-foreground/40 shrink-0">
        <span className="inline-block size-1.5 rounded-full bg-green-500/60" />
        <span>
          Period:{' '}
          <span className="font-medium text-muted-foreground/60">{DATA_PERIOD}</span>
        </span>
        <span>·</span>
        <span>Updated {asOf || '—'}</span>
        <span>·</span>
        <span>{scope}</span>
      </div>
      <Separator className="flex-1" />
    </div>
  )
}
