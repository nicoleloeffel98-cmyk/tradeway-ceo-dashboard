'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Bell, Target, TrendingUp, Landmark,
  Activity, Users, Megaphone, Compass, ClipboardCheck,
} from 'lucide-react'
import { NAV_ITEMS, NAV_GROUPS } from '@/lib/constants/nav'
import { useAlertsStore } from '@/lib/stores/useAlertsStore'
import { cn } from '@/lib/utils'

const ICONS: Record<string, React.FC<{ className?: string }>> = {
  LayoutDashboard, Bell, Target, TrendingUp, Landmark,
  Activity, Users, Megaphone, Compass, ClipboardCheck,
}

export function SidebarNav() {
  const pathname    = usePathname()
  const unreadCount = useAlertsStore((s) => s.unreadCount())

  return (
    <nav className="flex-1 px-2 space-y-4">
      {NAV_GROUPS.map((group) => {
        const items = NAV_ITEMS.filter((item) => item.group === group.key)
        return (
          <div key={group.key}>
            <p className="px-3 pb-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/40 select-none">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {items.map((item) => {
                const Icon     = ICONS[item.icon] ?? LayoutDashboard
                const isActive = pathname === item.href
                const count    = item.id === 'alerts' ? unreadCount : 0

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-brand-orange/10 text-brand-orange'
                        : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
                    )}
                  >
                    <Icon className={cn('size-4 shrink-0', isActive ? 'text-brand-orange' : 'group-hover:text-foreground')} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {count > 0 && (
                      <span className="flex size-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                        {count}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )
      })}
    </nav>
  )
}
