# DebtFree AI — Next Steps

## Status as of 2026-06-08

Build: PASSING  
Tests: 28/28  
ESLint: 0 errors  
TypeScript: 0 errors  
GitHub: https://github.com/edwinjostonc/debtfree-ai  
Local dev: `npm run dev` → http://localhost:3000  

---

## STEP 1 — Deploy to Production (Do This First)

### 1a. Get a free PostgreSQL database (Neon)

1. Go to https://neon.tech and sign up (free)
2. Create a new project called `debtfree-ai`
3. Copy the connection string — looks like:
   ```
   postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Save it — this is your `DATABASE_URL`

### 1b. Swap Prisma adapter for PostgreSQL

Currently using SQLite (`@prisma/adapter-better-sqlite3`) for local dev.  
For production, swap to PostgreSQL adapter.

**File to edit:** `src/lib/prisma.ts`

Change from:
```typescript
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
// ...
const adapter = new PrismaBetterSqlite3({ url: DB_URL });
```

Change to:
```typescript
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";
// ...
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(pool);
```

Install the packages first:
```bash
npm install @prisma/adapter-neon @neondatabase/serverless
```

**Better approach:** Use environment-based switching so local still uses SQLite:
```typescript
// src/lib/prisma.ts — production-ready version
import { PrismaClient } from "@/generated/prisma/client";

declare global {
  var prisma: InstanceType<typeof PrismaClient> | undefined;
}

function createPrisma() {
  if (process.env.DATABASE_URL?.startsWith("postgresql")) {
    // Production: PostgreSQL via Neon
    const { PrismaNeon } = require("@prisma/adapter-neon");
    const { Pool } = require("@neondatabase/serverless");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaNeon(pool);
    return new PrismaClient({ adapter });
  } else {
    // Local dev: SQLite
    const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
    const path = require("path");
    const DB_URL = path.join(process.cwd(), "prisma", "dev.db");
    const adapter = new PrismaBetterSqlite3({ url: DB_URL });
    return new PrismaClient({ adapter });
  }
}

export const prisma = global.prisma ?? createPrisma();
if (process.env.NODE_ENV !== "production") global.prisma = prisma;
```

### 1c. Run migration on production database

After setting DATABASE_URL in your environment:
```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

### 1d. Deploy to Vercel

1. Go to https://vercel.com → Import Git Repository
2. Select `edwinjostonc/debtfree-ai`
3. Set these environment variables in Vercel dashboard:

```
DATABASE_URL        = postgresql://... (from Neon)
NEXTAUTH_SECRET     = (run: openssl rand -base64 32 — or any 32+ char random string)
NEXTAUTH_URL        = https://your-app.vercel.app
```

4. Deploy

### 1e. After deploy — verify

- Visit `https://your-app.vercel.app` → landing page loads
- Register a new account
- Add a debt
- Check dashboard shows metrics
- Visit `/settings` → change base currency
- Visit `/coach` → ask a question

---

## STEP 2 — Polish (After Live)

### Toast notifications (stop page reloads)
Currently after adding a debt the page reloads (`window.location.reload()`).  
Replace with optimistic UI updates + toast notifications.  
Library: `sonner` (1KB, works with Next.js App Router)
```bash
npm install sonner
```

### Email verification
Currently users can register with any email.  
Add: send verification email on register, block login until verified.  
Use: Resend (free 3k emails/month) — https://resend.com

### Password reset
Add forgot password flow.  
Use: same Resend setup as email verification.

---

## STEP 3 — Growth Features

- PDF export of payoff plan (`@react-pdf/renderer`)
- Payment reminders via email (Vercel Cron + Resend)
- Progress milestones ("You're 50% debt free!")
- Shareable payoff plan (public read-only link)

---

## STEP 4 — Revenue (When Ready)

- Stripe subscription for Pro tier
- Pro features: unlimited debts, CSV export, advanced charts
- Free tier: up to 5 debts

---

## Architecture Reminder

```
src/
  app/
    (app)/          ← all authenticated pages
      dashboard/    ← main dashboard
      debts/        ← debt tracker
      income/       ← income + expenses
      simulator/    ← what-if calculator
      coach/        ← rule-based AI coach
      settings/     ← base currency, account
    actions/        ← all server mutations (auth checked)
    api/            ← AI chat route
  lib/
    financial/      ← pure math engine (payoff, simulator, metrics, coach)
    currency.ts     ← 43 currencies, frankfurter.app rates
    auth.ts         ← NextAuth v5
    prisma.ts       ← DB client (SQLite local, swap for prod)
  components/
    ui/             ← Button, Input, Select, Card, CurrencySelect
    dashboard/      ← Charts, DebtSummaryList
    debts/          ← DebtManager (add/delete/payment)
    income/         ← IncomeExpenseManager
    simulator/      ← SimulatorClient (real-time what-if)
    coach/          ← AiCoach (rule-based, no API)
    settings/       ← SettingsClient
    layout/         ← Navbar

prisma/
  schema.prisma     ← User, Debt, Income, Expense, Payment, Simulation
  dev.db            ← local SQLite (gitignored)
```

## Known Issues / Tech Debt

- `window.location.reload()` used after mutations → replace with router.refresh()
- 5 moderate npm audit warnings in Next.js internals (cannot fix without breaking)
- gstack browse binary stuck on this machine (named mutex deadlock) — use Brave/Chrome for manual testing
- Exchange rates cached in-memory (lost on server restart) → add Redis cache for prod

## Commands

```bash
npm run dev          # start local server
npm run build        # production build
npm test             # 28 unit tests
npm run db:migrate   # run prisma migrations
npm run db:studio    # open Prisma Studio (visual DB browser)
git push             # push to GitHub
```
