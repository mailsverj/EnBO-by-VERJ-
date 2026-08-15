---
name: BuDOM Backend Architecture
description: Full backend implementation — DB schema, API routes, auth, session management, and frontend wiring.
---

## Tech Stack
- **API Server**: Express 5, TypeScript, ESM, esbuild bundle at `artifacts/api-server/`
- **Database**: PostgreSQL via Drizzle ORM, shared `@workspace/db` package in `lib/db/`
- **Auth**: `express-session` + `connect-pg-simple` (table: `session`), `bcryptjs` for hashing
- **Session secret**: `SESSION_SECRET` env var (already provisioned)
- **Frontend API client**: `artifacts/bdms/src/lib/api.ts` — all endpoints + TypeScript types
- **Auth store**: `artifacts/bdms/src/store/auth.ts` — Zustand, calls real API

## DB Schema (all tables created)
- `users` — id, email, password_hash, name, roles (text[]), vbdo_id
- `session` — sid, sess (jsonb), expire (connect-pg-simple format, createTableIfMissing: false)
- `bdo_applications` — ref_id (APP-NNN), full_name, email, phone, NIN, BVN, bank, guarantor, status, admin_notes
- `bdos` — vbdo_id (VBDO-NNNN), user_id, name, email, status, leads_count, total_value
- `leads` — lead_ref (LEAD-NNNNN), customer_id, customer_name, source_bdo_id, stage, value
- `customers` — cid_ref (CID-NNNNNN), name, type, location, source_bdo_id
- `designs` — design_ref (DESIGN-NNNNN), locked_by_id (int), lock_started_at, 3-hour lock timeout
- `design_history` — design_ref, engineer_id, action, started_at, ended_at
- `inventory` — sku, brand, model, category, capacity_kw/kwh/w, cost_price, selling_price, stock_qty; protection device fields: current_rating, voltage_rating, breaker_type, pole_count, sensitivity_ma
- `price_audit` — sku, field, prev_value, new_value, changed_by_name, changed_at
- `invoices` — invoice_ref (INV-YYYY-NNNNN), line_items (jsonb), status, approved_by_name
- `payments` — invoice_ref, amount, payment_method, reference, type (full/partial)
- `commissions` — bdo_id, invoice_ref, project_value, rate (3%), amount, status (Pending/Paid)
- `expenses` — date, category, description, amount, payment_method, vendor

## API Routes (all at /api/*)
- POST/GET `/auth/login|logout|me`
- POST/GET/PATCH `/applications` (public POST, auth GET/PATCH)
- GET `/users` (Chief Admin/Super Admin/Management only)
- GET/POST/PATCH `/bdos/:vbdoId`
- GET/POST/PATCH `/leads/:leadRef`
- GET/POST/PATCH `/customers/:cidRef`
- GET/POST/PATCH `/designs/:designRef` + POST `/designs/:id/lock|unlock`
- GET/POST/PATCH `/inventory/:sku` + GET `/inventory/:sku/audit`
- GET/POST/PATCH `/invoices/:invoiceRef` + POST `/invoices/:id/payments`
- GET/PATCH `/commissions/:id`
- GET/POST/PATCH/DELETE `/expenses/:id`
- GET `/finance/summary`

## Frontend Wiring
- Vite proxy: `${basePath}/api` → `http://localhost:8080` with path rewrite (strips basePath)
- All 16 pages now use `useQuery` + `useMutation` from @tanstack/react-query
- Auth guard in App.tsx: unauthenticated → /login redirect, initialized flag prevents flash
- Shell.tsx: shows user name + avatar initials, logout button (no more mock user switcher)

## Seeded Users (password: VERJ@2026)
- admin@verjsolar.com — Chief Admin + Lead Technical Officer
- hr@verjsolar.com — Recruitment/Admin
- eng1@verjsolar.com — Lead Technical Officer
- sales@verjsolar.com — Sales + Sales Admin
- finance@verjsolar.com — Finance
- bdo1@verjsolar.com — BDO (VBDO-0001)
- bdo2@verjsolar.com — BDO (VBDO-0002)

## Seeded Data
- 4 BDOs, 4 customers, 5 leads, 4 designs, 37 inventory items (inverters 4–96kW, batteries 5–96kWh, panels, cables, MCBs/MCCBs/RCDs/SPDs)

## Key Decisions
- **bcryptjs** (not bcrypt) — bcrypt is in esbuild externals list, bcryptjs is bundled fine
- **Passwords stored with $2b$ prefix** (bcryptjs default, bcrypt.compare handles both $2a$ and $2b$)
- **Commission auto-generated** when invoice status patched to "Paid" (3% of total)
- **Design locks**: 3-hour timeout, checked server-side on GET /designs, lock released after timeout
- **canSeePrices**: server strips costPrice/sellingPrice for Engineer role; client reads `data.canSeePrices`
- **formatCurrency** still imported from data/mock.ts (pure utility, not actual data — acceptable)

**Why:** Keeping bcryptjs avoids the need to externalize it; esbuild bundles it correctly.
