import { SidebarNav } from './SidebarNav'
import { Separator } from '@/components/ui/separator'
import { CEO_INITIALS, CEO_NAME, CEO_TITLE } from '@/lib/constants/ceo'

export function Sidebar() {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-brand-orange text-white font-bold text-sm">
          TW
        </div>
        <div>
          <p className="text-sm font-bold text-foreground leading-none">Tradeway</p>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">CEO Dashboard</p>
        </div>
      </div>
      <Separator />

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3 scrollbar-hide">
        <SidebarNav />
      </div>

      <Separator />
      {/* Footer */}
      <div className="p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-full bg-brand-orange text-xs font-bold text-white">
            {CEO_INITIALS}
          </div>
          <div>
            <p className="text-xs font-medium text-foreground">{CEO_NAME}</p>
            <p className="text-[10px] text-muted-foreground">{CEO_TITLE}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
