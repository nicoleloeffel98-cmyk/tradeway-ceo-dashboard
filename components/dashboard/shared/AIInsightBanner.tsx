'use client'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AIInsightBannerProps {
  headline:    string
  detail?:     string
  source?:     string
  confidence?: 'high' | 'medium' | 'low'
  className?:  string
}

const CONF_COLOR: Record<string, string> = {
  high:   'text-green-400/70',
  medium: 'text-amber-400/70',
  low:    'text-red-400/70',
}

const CONF_DOT: Record<string, string> = {
  high:   'bg-green-500',
  medium: 'bg-amber-500',
  low:    'bg-red-500',
}

export function AIInsightBanner({ headline, detail, source, confidence, className }: AIInsightBannerProps) {
  return (
    <div className={cn(
      'flex gap-3 rounded-lg border border-brand-orange/20 bg-brand-orange/5 p-4',
      className,
    )}>
      <Sparkles className="mt-0.5 size-4 shrink-0 text-brand-orange" />
      <div className="flex-1 space-y-1 min-w-0">
        <p className="text-sm font-medium text-foreground leading-snug">{headline}</p>
        {detail && (
          <p className="text-xs text-muted-foreground leading-relaxed">{detail}</p>
        )}
        {(source || confidence) && (
          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-brand-orange/10">
            {source && (
              <span className="text-[10px] text-muted-foreground/50 truncate">{source}</span>
            )}
            {confidence && (
              <div className={cn('flex items-center gap-1 ml-auto shrink-0', CONF_COLOR[confidence])}>
                <span className={cn('size-1.5 rounded-full inline-block', CONF_DOT[confidence])} />
                <span className="text-[10px] font-medium capitalize">{confidence} confidence</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
