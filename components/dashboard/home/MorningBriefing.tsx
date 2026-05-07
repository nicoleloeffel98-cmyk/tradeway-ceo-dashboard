import { AIInsightBanner } from '@/components/dashboard/shared/AIInsightBanner'
import { mockAIInsights } from '@/lib/data/mock-ai-insights'

export function MorningBriefing() {
  const insight = mockAIInsights.home
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
        CEO Morning Brief —{' '}
        {new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>
      <AIInsightBanner
        headline={insight.headline}
        detail={insight.detail}
        source={insight.source}
        confidence={insight.confidence}
      />
    </div>
  )
}
