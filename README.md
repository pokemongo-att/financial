# Finance Planner

ระบบ Web Application สำหรับสรุปการเงินรายเดือน: รายรับ/รายจ่าย/เงินออม/เป้าหมาย/ดูแลครอบครัว + Portfolio หุ้น/กองทุน/BTC/เงินฝาก + Dividend Dashboard

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4** (Fintech Clean UI)
- **Drizzle ORM** + drizzle-kit migrations
- **Neon Postgres** (serverless)
- **shadcn/ui-style components** + Lucide icons
- **Recharts** (dashboard charts)
- **Sonner** (toast notifications)
- **Zod** (validation)

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment

Create `.env.local` with:

```
DATABASE_URL=postgresql://...your-neon-connection-string...
```

### 3. Run migrations

```bash
pnpm db:generate
pnpm db:migrate
```

### 4. Seed demo data

```bash
pnpm db:seed
```

This creates:
- Demo user (`demo@local`)
- Default template with 21 items (income/expense/saving/goal/family)
- Monthly plans for 2026-01 and 2026-02
- 3 goal accounts with deposit/withdraw transactions
- 2 family members with transactions
- 4 asset accounts (STOCK, FUND, CRYPTO, BANK) with transactions

### 5. Run dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Pages

| Route | Description |
|-------|-------------|
| `/dashboard` | Monthly overview with summary cards, chart, pending items |
| `/month/[YYYY-MM]` | Monthly plan detail with line items, status tracking |
| `/templates` | Manage reusable monthly templates |
| `/templates/[id]` | Edit template items |
| `/goals` | Goal savings accounts with balances |
| `/goals/[id]` | Goal detail with deposit/withdraw timeline |
| `/family` | Family support tracking (parents/children) |
| `/portfolio` | Asset holdings (stocks, funds, crypto, bank deposits) |
| `/portfolio/[id]` | Asset detail with transaction history |
| `/portfolio/dividends` | Dividend dashboard with totals and per-asset breakdown |

## Project Structure

```
src/
  app/           # Next.js App Router pages
  actions/       # Server Actions (CRUD)
  components/    # Shared UI components
    ui/          # Base components (Button, Card, Badge, etc.)
  db/            # Drizzle schema, client, seed
  lib/           # Utilities, calc engine, validators
    calc/        # Pure calculation functions
    validators/  # Zod schemas
```

## Key Design Decisions

- **Money stored as integer cents** (`amountCents`) to avoid float errors
- **Monthly plan = snapshot** from template, editable per month
- **Portfolio = continuous ledger** with transaction-based calculations
- **Goal withdrawals** are separate movements, not auto-counted as income
- **Average cost method** for stock SELL calculations
- **Seed is idempotent** — safe to run multiple times
