import { RAG_COLORS } from '@/lib/utils/rag'
import { cn } from '@/lib/utils'
import type { Priority } from '@/lib/types'

interface PriorityCardProps {
  priority: Priority
  rank:     number
}

export function PriorityCard({ priority, rank }: PriorityCardProps) {
  const color = RAG_COLORS[priority.status]
  return (
    <div className="group space-y-1.5">
      <div className="flex items-start gap-2">
        <span
          className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-bold text-muted-foreground"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
        >
          {rank}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-foreground leading-snug">{priority.title}</p>
          {priority.dueDate && (
            <p className="text-[10px] text-muted-foreground">
              Due {new Date(priority.dueDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
            </p>
          )}
        </div>
        <span className={cn('shrink-0 text-xs font-semibold tabular-nums')} style={{ color }}>
          {priority.progress}%
        </span>
      </div>
      {/* Custom progress bar — avoids Base UI ARIA artifact */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted/40">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${priority.progress}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
