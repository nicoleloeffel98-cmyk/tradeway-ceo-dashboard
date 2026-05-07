import type { AIInsight } from '@/lib/types'

export const mockAIInsights: Record<string, AIInsight> = {
  home: {
    module: 'home',
    headline: 'Revenue tracking R3.8M below MTD target with Gauteng operations flagging elevated no-show rates for the third consecutive week.',
    detail: 'Two items require CEO sign-off today. Overdue AR at R4.2M is the most urgent financial risk — conversations with the top 3 delinquent accounts would recover an estimated R3.1M. The Pick n Pay proposal deadline is Thursday and represents the single highest-value near-term opportunity.',
    source: '30-day KPI aggregation across all modules',
    confidence: 'high',
  },
  bd: {
    module: 'bd',
    headline: 'Pipeline growth is steady at R142M but win rate has declined three consecutive months to 41% — qualification discipline is eroding.',
    detail: 'The BD funnel shows healthy top-of-funnel volume (14 prospects) but a conversion bottleneck at the proposal stage. Reviewing deal qualification criteria and introducing a win/loss debrief process before Q3 is recommended.',
    source: 'BD pipeline + win-rate trend, last 90 days',
    confidence: 'medium',
  },
  sales: {
    module: 'sales',
    headline: 'Q2 revenue forecast at R52.1M suggests a strong May close if the pending Vodacom and Shoprite contracts convert in time.',
    detail: 'Deal velocity is 4 days below the 30-day target. The two largest accounts (James Khumalo\'s book) are outperforming at 108% attainment — extending his methodology to the Gauteng team could close the gap.',
    source: 'Revenue actuals + deal velocity model, MTD',
    confidence: 'high',
  },
  finance: {
    module: 'finance',
    headline: 'EBITDA margin holding at 17.9% despite revenue shortfall — cost discipline is working. AR recovery is the single highest-impact action available this month.',
    detail: 'Cash position is projected to fall below the R20M reserve threshold by end of Q3 if AR recovery does not accelerate. OpEx ratio at 21.4% is improving and trending toward the 20% annual target.',
    source: 'Finance module: cash flow, AR and margin data',
    confidence: 'high',
  },
  operations: {
    module: 'operations',
    headline: 'Activation success rate at 94.2% nationally, but Gauteng no-show rate at 8.2% needs immediate intervention — three client campaigns are at delivery risk.',
    detail: 'KwaZulu-Natal is 12% under-provisioned for the next 30 days. Western Cape and Limpopo are performing at record levels and could serve as operational benchmarks for other regions.',
    source: 'Regional activation data + incident log, real-time',
    confidence: 'high',
  },
  people: {
    module: 'people',
    headline: 'Headcount stable at 224 with attrition trending down. Ambassador pool at 15,200 is sufficient — Q3 capacity shows a 340-ambassador gap in August.',
    detail: 'The 7 open roles include 3 critical operations positions. August capacity shortfall requires immediate pipeline building. Positive signal: attrition has improved 4.4% over six months.',
    source: 'HR system + 8-week capacity model',
    confidence: 'medium',
  },
  campaigns: {
    module: 'campaigns',
    headline: 'Average campaign ROI of 3.4x is above the 3.0x target. Two active campaigns carry elevated client satisfaction risk that could affect renewal.',
    detail: 'Standard Bank (NPS 7.2) and Tiger Brands (NPS 7.6) are the two accounts below the 8.0 threshold. Proactive account management check-ins recommended before month-end.',
    source: 'Campaign ROI + NPS data, last 30 days',
    confidence: 'medium',
  },
  strategic: {
    module: 'strategic',
    headline: 'Base scenario of R640M is achievable if BD win rate recovers to 43% in Q3 and Gauteng operations are stabilised within 4 weeks.',
    detail: 'The downside scenario at R580M (85% of target) is triggered by two conditions: continued win rate decline and the loss of either Pick n Pay or Shoprite as anchor accounts. Both risks are currently in the amber zone.',
    source: 'Scenario model using pipeline, ops and finance inputs',
    confidence: 'medium',
  },
  scorecard: {
    module: 'scorecard',
    headline: 'Three of nine modules are amber, two are red. Finance and Operations require CEO attention this week.',
    detail: 'The executive scorecard shows a consistent pattern: revenue generation is healthy but conversion efficiency (win rate, AR recovery, no-show rate) is the common thread across red and amber indicators.',
    source: 'Weighted aggregation across all 9 module scores',
    confidence: 'high',
  },
}
