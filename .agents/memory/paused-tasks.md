---
name: Paused tasks
description: Tasks that were in-flight when user paused work to do GitHub transfer; resume after transfer is complete.
---

## Paused on 2026-08-19

### Task #24 — Warn BDOs of unsaved lead progress (PENDING)
State when paused: PENDING (blocked by CONCURRENCY_LIMIT at the time).
Work needed: In `NewLeadDialog.tsx`, when `createLead.isPending` is true show an inline "Saving…" banner and disable the close/cancel button so the BDO cannot dismiss the dialog before the server confirms the lead was created.

### Task #25 — Portal site assessments (IN_PROGRESS)
State when paused: IN_PROGRESS.
Work needed: Full site-assessment portal launch — form, auto-design generation, auto-invoice generation.
No partial code was committed for this task before the pause; start from scratch when resumed.

**Why saved:** User explicitly paused both tasks to handle a GitHub repository transfer. Resume as soon as the transfer is done.
