---
name: BuDOM by VERJ — platform spec
description: Official product identity, architecture, and 40-point functional spec for the VERJ business operations platform.
---

## Product Identity
- **Official name**: BuDOM by VERJ  
- **Full name**: VERJ BuDOM — Business Development & Operations Management System  
- **UI lockup**: "BuDOM / by VERJ" on login/header/invoices; standalone "BuDOM" mark inside the app  
- **Parent brand**: VERJ (company); BuDOM (product/platform)  

**Why:** The platform was originally called BDMS but user confirmed BuDOM is the official identity going forward.

## Core Business Chain (most important architectural principle)
BDO → Lead → Customer → Load Schedule → Design → Engineer → Inventory Components → Technical Approval → Invoice → Sales Approval → Payment → Inventory Movement → Revenue/COGS → Commission → Accounting → Profitability → Analytics

Every record must retain the IDs to trace its full chain.

## Key Spec Additions (not yet implemented in the frontend)
- Battery formula: **Total Night-time Load Energy × 1.25** (NOT total load × backup hours — backup hours field removed; night energy calculated from appliance schedule hours/night field)
- Battery selection table: 0–5kWh→5kWh, 5.1–10→10kWh, 10.1–16→16kWh, 16.1–32→32kWh, 32.1–48→48kWh, then continue progression
- PV: (Total Battery Size ÷ 6 + Total Load) × 1.67
- Inverter: find from inventory within 5kW tolerance; "DESIGN REVIEW REQUIRED" if no match; progression must be scalable, not hard-coded
- Engineer actions: SAVE DESIGN | APPROVE / CONVERT TO INVOICE
- Lead Technical Officer: approve/edit/reject design (rejection requires mandatory reason + audit trail)
- Sales workflow: access leads/customers/designs/invoices/selling prices/payments/sales reports; can download/share/reject/edit invoices
- Invoice inherits: Customer ID, Lead ID, Source BDO ID, Design ID, Engineer, system specs, applicable prices
- Customer-facing invoice: Solar Plan format, no brand names unless required, major components priced individually up to 48kW
- Invoice sharing: Share with BDO+Customer / BDO only / Customer only
- Invoice approval: Sales + Chief Admin; on approval, auto-send to customer (email+WhatsApp) and BDO (portal+WhatsApp)
- Inventory: product ID, qty purchased/sold/available, reorder indicator, voltage field; document import with duplicate detection
- Accounting module: Payments, Receivables, Payables, Expenses (with attachment), project profitability, spreadsheet backup
- BDO dual role with Engineer: can switch Engineer Mode ↔ BDO Mode without second account
- Financial analytics: P&L, Revenue Report, Sales Report, Expense Report, Project Profitability, Inventory Valuation, AR, AP, Payment Report, Outstanding Invoice, BDO Performance, Commission Report
- BuDOM auto-exports spreadsheet backup for: accounting data and per-BDO activity data

## Logo Colour Rule
- Dark/black background (sidebar): amber/yellow via CSS filter
- White background (invoice, documents): solid black via CSS filter: brightness(0)

**How to apply:** In Shell.tsx use `filter: brightness(0) saturate(100%) invert(73%) sepia(96%) saturate(600%) hue-rotate(2deg) brightness(105%)`. In invoice/white contexts use `filter: brightness(0)`.
