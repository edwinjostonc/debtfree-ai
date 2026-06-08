# DebtFree AI — Architecture Overview

## Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: SQLite (dev) / PostgreSQL (prod) via Prisma 7
- **Auth**: NextAuth v5 with credentials provider
- **AI**: Anthropic Claude claude-sonnet-4-6
- **Charts**: Recharts
- **Validation**: Zod v4
- **State**: Server Components + Server Actions (primary), Zustand (UI state)

## Key Design Principles
1. Financial calculations are ALWAYS code, never AI
2. AI adds coaching and explanation, never numbers
3. Per-user personalization via financial context injection
4. Security first — all Server Actions verify auth

## Data Flow
```
User Input → Server Action → Financial Engine → Database
                                  ↓
                          AI Context Builder
                                  ↓
                         Claude claude-sonnet-4-6
                                  ↓
                        Streaming Response → UI
```

## Financial Engine Modules
- `debtCalculator.ts` — snowball/avalanche/hybrid strategy
- `interestEngine.ts` — amortization, APR/APY calculations
- `simulator.ts` — what-if scenario modeling
- `metrics.ts` — DTI, utilization, progress metrics
