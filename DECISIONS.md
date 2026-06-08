# Architecture Decisions

## 2026-06-08 — Initial Architecture

### Database: SQLite (dev) → PostgreSQL (prod)
SQLite for zero-config local dev. Switch to PostgreSQL via DATABASE_URL for prod deployment.

### Auth: next-auth v5 (beta) with credentials provider
Email/password auth with bcrypt hashing. Session-based (JWT). No OAuth initially — keeps it simple for personal finance app where users want privacy.

### AI: Anthropic Claude claude-sonnet-4-6
Used only for coaching, explanations, and personalized recommendations. NEVER for financial calculations. All math is pure TypeScript.

### Financial Engine: Pure TypeScript, no LLM
Snowball, avalanche, hybrid strategies all computed in code. LLM explains results, never generates them.

### State: Server Actions + React Server Components
Mutations via Server Actions. Data fetching via RSC. Client state minimal (Zustand only for UI state). No Redux complexity.

### Prisma v7: Adapter-based connection
Prisma 7 removed url from schema.prisma. Using @prisma/adapter-better-sqlite3 for local dev. Production: swap adapter for PostgreSQL.

### Deployment target: Vercel
Next.js + Vercel is the simplest production path. SQLite → PostgreSQL migration needed for prod (Supabase or Neon recommended).

### Per-user personalization
Every AI response includes the user's actual debt data, income, DTI, and payoff timeline as context. No generic advice.
