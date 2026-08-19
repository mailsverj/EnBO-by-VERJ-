---
name: Lead and customer write consistency
description: Concurrency rules for allocating business references and maintaining BDO/customer lead-value aggregates.
---

Every runtime writer that allocates lead or customer business references must participate in the same transaction-scoped allocation lock. Lead value changes must calculate aggregate deltas from the current lead row after locking it for update.

**Why:** Concurrent creates can otherwise select the same next reference, while concurrent value edits can both calculate from a stale value and double-apply aggregate changes.

**How to apply:** When adding another lead/customer creation path, share the existing reference-allocation mechanism. When changing lead value, lock and reread the lead inside the same transaction that updates the lead and its customer/BDO totals.