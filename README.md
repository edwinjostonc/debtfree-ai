# DebtFree AI

AI-powered debt management platform. Track debts, simulate payoff strategies, and get personalized coaching from an AI that knows your real financial situation.

## Features

- **Debt Tracker** — Add all debts with balances, interest rates, and payment history
- **Income & Expense Manager** — Track cash flow to maximize debt payments  
- **Payoff Engine** — Snowball, avalanche, and hybrid strategies with precise math
- **What-If Simulator** — See how extra payments, income changes, or lump sums affect your debt-free date
- **AI Coach** — Claude-powered coach that reads your actual finances, gives personalized advice
- **Progress Dashboard** — Charts showing debt payoff trajectory and key metrics

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Prisma 7** + SQLite (dev) / PostgreSQL (prod)
- **NextAuth v5** — email/password auth with JWT sessions
- **Anthropic Claude claude-sonnet-4-6** — AI coaching only (never financial math)
- **Tailwind CSS v4** + custom UI components
- **Recharts** — data visualization

## Quick Start

### 1. Install

```bash
cd debtfree-ai
npm install
```

### 2. Environment

```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="sk-ant-..."
```

Get an Anthropic API key at [console.anthropic.com](https://console.anthropic.com)

### 3. Database

```bash
npm run db:migrate
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → Create an account → Add your debts.

## Testing

```bash
npm test              # 28 unit tests (financial engine)
npm run test:coverage # With coverage
```

Test coverage: interest calculations, snowball/avalanche/hybrid strategies, simulator, DTI metrics, edge cases.

## Architecture

Financial calculations are **always code** — never AI. The AI coach only explains, coaches, and recommends. It never generates numbers.

```
User Input
    ↓
Server Actions (session verified)
    ↓
Financial Engine (pure TypeScript math)
    ↓
Database (Prisma + SQLite/PostgreSQL)
    ↓
AI Context Builder (injects real user data)
    ↓
Claude claude-sonnet-4-6 (coaching only)
    ↓
Streaming response → UI
```

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import to [vercel.com](https://vercel.com)
3. Set environment variables (use PostgreSQL `DATABASE_URL` from Neon or Supabase)
4. Deploy

### PostgreSQL for production

Replace `DATABASE_URL` with a PostgreSQL connection string:
```
DATABASE_URL="postgresql://user:password@host:5432/debtfree"
```

Then swap the adapter in `src/lib/prisma.ts` to `@prisma/adapter-pg`.

## Security

- Passwords: bcrypt (12 rounds)
- Sessions: JWT, httpOnly cookies
- Auth check on every Server Action
- Users only see their own data (userId filter on all queries)
- Prisma parameterized queries (SQL injection safe)
- Zod validation on all inputs
- API keys server-side only

## Financial Accuracy

All math uses standard formulas:
- Monthly interest: `balance × (APR / 100 / 12)`
- Amortization: `P × r(1+r)^n / ((1+r)^n - 1)`
- DTI: `total minimum payments ÷ gross monthly income`
- Payoff projection: month-by-month amortization with snowball payment rolling

> **Disclaimer**: DebtFree AI is a planning tool, not licensed financial advice. Consult a certified financial planner for professional guidance.
