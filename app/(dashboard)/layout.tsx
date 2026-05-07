import { DashboardShell } from '@/components/dashboard/shell/DashboardShell'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>
}
