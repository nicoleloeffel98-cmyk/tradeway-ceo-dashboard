export type RAGStatus = 'red' | 'amber' | 'green' | 'neutral'

export const RAG_COLORS: Record<RAGStatus, string> = {
  green:   '#16a34a',
  amber:   '#d97706',
  red:     '#dc2626',
  neutral: '#64748b',
}

export const RAG_BG_COLORS: Record<RAGStatus, string> = {
  green:   'rgba(22,163,74,0.12)',
  amber:   'rgba(217,119,6,0.12)',
  red:     'rgba(220,38,38,0.12)',
  neutral: 'rgba(100,116,139,0.12)',
}

export const RAG_TEXT_CLASSES: Record<RAGStatus, string> = {
  green:   'text-green-400',
  amber:   'text-amber-400',
  red:     'text-red-400',
  neutral: 'text-slate-400',
}

export const RAG_BADGE_CLASSES: Record<RAGStatus, string> = {
  green:   'bg-green-950 text-green-400 border-green-800',
  amber:   'bg-amber-950 text-amber-400 border-amber-800',
  red:     'bg-red-950 text-red-400 border-red-800',
  neutral: 'bg-slate-800 text-slate-400 border-slate-700',
}

export function computeRAG(
  value: number,
  target: number,
  inverted = false,
): RAGStatus {
  if (target === 0) return 'neutral'
  const variance = inverted
    ? ((target - value) / target) * 100
    : ((value - target) / target) * 100
  if (variance >= -5)  return 'green'
  if (variance >= -15) return 'amber'
  return 'red'
}

export function ragFromStatus(status: string): RAGStatus {
  if (status === 'red' || status === 'amber' || status === 'green') return status
  return 'neutral'
}
