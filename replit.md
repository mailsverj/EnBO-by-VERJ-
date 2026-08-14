# VERJ SOLAR BDMS

Business Development Management System for VERJ SOLAR — a Nigerian solar energy company. Central platform managing the entire journey from BDO recruitment through lead generation, engineering, invoicing, commissions, and financial analysis.

## Run & Operate

- `pnpm --filter @workspace/bdms run dev` — run the frontend (via `artifacts/bdms: web` workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port assigned by workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec (when backend is connected)
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only, when backend is connected)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, TailwindCSS v4, shadcn/ui, wouter, Recharts, Framer Motion, zustand
- Fonts: Plus Jakarta Sans (UI), JetBrains Mono (IDs/data)
- API: Express 5 (not yet connected to frontend)
- DB: PostgreSQL + Drizzle ORM (schema not yet defined — backend phase is next)
- Validation: Zod, drizzle-zod
- API codegen: Orval (from OpenAPI spec)

## Where things live

- `artifacts/bdms/src/pages/` — all page components (16 pages)
- `artifacts/bdms/src/data/mock.ts` — all mock data (source of truth for all data shapes)
- `artifacts/bdms/src/store/auth.ts` — simulated auth/role store (zustand)
- `artifacts/bdms/src/components/` — shared layout, sidebar, cards, etc.
- `lib/api-spec/openapi.yaml` — OpenAPI spec (only health endpoint for now; expand when backend is built)
- `lib/db/src/schema/` — Drizzle schema (empty; define when backend is built)
- `artifacts/api-server/src/routes/` — Express routes (only health for now)

## Architecture decisions

- **Frontend-first build**: Full static frontend with realistic mock data built before the backend. All data shapes are defined in `artifacts/bdms/src/data/mock.ts` — use these as the ground truth when writing the DB schema and OpenAPI spec.
- **Role simulation**: The sidebar footer has a role switcher (zustand store in `store/auth.ts`). When auth is added, replace the store with a real session.
- **Currency**: Nigerian Naira (₦). All amounts stored as integers (kobo) or floats (naira).
- **ID formats**: VBDO-0001 (BDOs), LEAD-00482 (leads), DESIGN-00192 (designs), INV-2026-00482 (invoices), CUST-0001 (customers).
- **Commission**: Always 3% of total project value.

## Product

BDMS covers 9 connected systems:
1. **BDO Management** — Applications (KYC review, shortlisting), BDO directory, profiles
2. **Lead Management** — Kanban + table, full sales funnel (New Lead → Won/Lost), activity audit trail
3. **Customer Management** — Directory, full history (leads, designs, invoices, payments)
4. **Engineering** — Solar System Design Calculator, technical designs, approval workflow
5. **Inventory** — Equipment directory (panels, inverters, batteries, cables, accessories)
6. **Invoicing** — Full invoice lifecycle, PDF download, Share to BDO
7. **Commission** — 3% ledger per BDO per project
8. **Financial Analysis** — P&L, revenue charts, date-range filtering
9. **Settings** — Role-based user management

## User preferences

_Populate as explicit preferences are stated._

## Gotchas

- Google Fonts `@import url(...)` must be the **first line** of `index.css` — before `@import 'tailwindcss'`. PostCSS fails silently otherwise.
- `zustand` is installed in `artifacts/bdms/` for the auth store.
- The role switcher is UI-only; all pages are accessible regardless of role in the current static build.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Backend tasks are in the project task list (Tasks #1–#3)
