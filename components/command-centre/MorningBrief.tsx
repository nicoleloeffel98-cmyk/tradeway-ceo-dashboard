'use client'
import { motion } from 'framer-motion'
import { Sunrise } from 'lucide-react'
import { useAlertsStore }    from '@/lib/stores/useAlertsStore'
import { useDecisionsStore } from '@/lib/stores/useDecisionsStore'
import { mockForecastSummary } from '@/lib/data/mock-forecasting'

// Split on ". " only when followed by a capital letter (avoids breaking "R4.2M")
function firstSentence(text: string): string {
  return text.split(/\. (?=[A-Z])/)[0].replace(/\.$/, '')
}

export function MorningBrief() {
  const alerts    = useAlertsStore((s) => s.alerts)
  const decisions = useDecisionsStore((s) => s.decisions)

  const topCritical = alerts.find((a) => a.severity === 'critical' && !a.isRead)
  const topDecision = decisions.find((d) => d.status === 'pending' && d.priority === 'urgent')
    ?? decisions.find((d) => d.status === 'pending' && d.priority === 'high')
    ?? decisions.find((d) => d.status === 'pending')

  const sentences = [
    topCritical
      ? `${firstSentence(topCritical.summary)}.`
      : 'No critical overnight issues — operations and collections tracking normally.',
    topDecision
      ? `Most important decision today: ${topDecision.title}${topDecision.financialStake ? ` (${topDecision.financialStake})` : ''}.`
      : 'Decision queue is clear — no urgent actions pending.',
    `Cash runway at ${mockForecastSummary.cashRunwayDays} days and Q3 ambassador capacity gap of 340 are the two time-sensitive risks requiring action this month.`,
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-xl border border-border bg-card border-l-[3px] border-l-[#e8640c] px-4 py-3"
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#e8640c]/15">
          <Sunrise className="size-3.5 text-[#e8640c]" />
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#e8640c]/80">Morning Brief</p>
          <ol className="space-y-1">
            {sentences.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-px shrink-0 font-mono text-[10px] font-bold text-muted-foreground/40 leading-[1.6]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-[12px] text-foreground/90 leading-relaxed">{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </motion.div>
  )
}
