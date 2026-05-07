import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — hidden on mobile */}
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar />
      </div>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
